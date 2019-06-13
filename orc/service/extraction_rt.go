package service

import (
	"context"
	"encoding/json"
	"strconv"
	"strings"
	"time"

	config "github.com/cennznet/explorer/orc/cfg"
	"github.com/cennznet/explorer/orc/core"
	"github.com/cennznet/explorer/orc/model"
	"github.com/gorilla/websocket"
	"github.com/mongodb/mongo-go-driver/mongo"
	"github.com/mongodb/mongo-go-driver/mongo/options"
	"github.com/mongodb/mongo-go-driver/x/bsonx"
	"github.com/sirupsen/logrus"
)

const (
	//method = "chain_subscribeFinalisedHeads"
	method = "chain_subscribeNewHead"

	priority = 1
)

type reqBodySub struct {
	JSONRPC string        `json:"jsonrpc"`
	ID      int           `json:"id"`
	Method  string        `json:"method"`
	Params  []interface{} `json:"params"`
}

type respBodySub struct {
	JSONRPC string `json:"jsonrpc"`
	ID      int    `json:"id"`
	Result  int    `json:"result"`
}

type respBodyResult struct {
	Number         string `json:"number"`
	ParentHash     string `json:"parentHash"`
	StateRoot      string `json:"stateRoot"`
	ExtrinsicsRoot string `json:"extrinsicsRoot"`
}

type respBodyParams struct {
	Result       *respBodyResult `json:"result"`
	Subscription int             `json:"subscription"`
}

type respBody struct {
	JSONRPC string          `json:"rsonrpc"`
	Method  string          `json:"method"`
	Params  *respBodyParams `json:"params"`
}

type extractionRT struct {
	log        *logrus.Entry
	cfg        *config.Config
	conn       *websocket.Conn
	queue      *mongo.Collection
	extraction *extraction
}

func NewExtractionRT(log *logrus.Entry, cfg *config.Config,
	conn *websocket.Conn, queue *mongo.Collection) *extractionRT {
	return &extractionRT{
		log:        log.WithFields(logrus.Fields{"method": method}),
		cfg:        cfg,
		conn:       conn,
		queue:      queue,
		extraction: NewExtraction(log, cfg, queue),
	}
}

func (s *extractionRT) Receive(ctx context.Context) <-chan int64 {
	out := make(chan int64)

	log := s.log

	go func() {
		defer close(out)

		_, msg, err := s.conn.ReadMessage()
		if err != nil {
			if !websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				log.Errorf("Error reading message: %s", err)
				return
			}
			log.Infoln(err)
			return
		}

		var sub respBodySub
		err = json.Unmarshal([]byte(msg), &sub)
		if err != nil {
			log.Errorf("Error deserialising response: %s", err)
			return
		}
		log.Infof("Subscription ID: %d", sub.Result)

		for {
			_, msg, err = s.conn.ReadMessage()
			if err != nil {
				if !websocket.IsCloseError(err, websocket.CloseNormalClosure) {
					log.Errorf("Error reading message: %s", err)
					return
				}
				log.Infoln(err)
				return
			}

			var resp respBody
			err = json.Unmarshal([]byte(msg), &resp)
			if err != nil {
				log.Errorf("Error deserialising response: %s", err)
				continue
			}

			if resp.Params == nil {
				log.Errorf("Invalid response: %+v", resp)
				continue
			}
			if resp.Params.Result == nil {
				log.Errorf("Invalid response: %+v", resp)
				continue
			}

			n := resp.Params.Result.Number
			b, err := strconv.ParseInt(strings.TrimLeft(n, "0x"), 16, 64)
			if err != nil {
				log.Errorf("Error parsing int: %s", err)
				continue
			}

			out <- b
		}
	}()

	return out
}

// handle jumpy blocks
func (s *extractionRT) Schedule(ctx context.Context, in <-chan int64) <-chan int64 {
	out := make(chan int64)

	log := s.log

	go func() {
		defer close(out)

		var prev int64
		for b := range in {
			if prev == 0 {
				prev = b - 1
			}
			for i := prev + 1; i <= b; i++ {
				out <- i
				log.WithFields(logrus.Fields{"b": i}).Infoln("Block task scheduled")
			}
			prev = b
		}
	}()
	return out
}

func (s *extractionRT) Extract(ctx context.Context, in <-chan int64) <-chan int64 {
	out := make(chan int64, 10) // Buffered channel to reduce chance of blocking

	log := s.log

	go func() {
		defer close(out)

		for b := range in {
			now := time.Now().UTC()

			// NOTE: Bypass 'ready' queue as extracted immediately!
			t := model.NewBkTask(now, priority, b, core.StateStarted)

			filter := t.FindByBlockNumber()
			update := t.Upsert()

			opts := options.FindOneAndUpdate()
			opts = opts.SetUpsert(true)
			opts = opts.SetReturnDocument(options.After)

			var result bsonx.Doc
			err := s.queue.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result)
			if err != nil {
				log.Errorf("Error queueing task: %s", err)
				continue
			}

			result2, err := s.extraction.RunBkTask(ctx, &result)
			if err != nil {
				log.Errorf("Error running task: %s", err)
				continue
			}

			state, err := s.extraction.SummariseBkTask(result2)
			if err != nil {
				log.Errorf("Error summarising block task: %s", err)
				continue
			}

			// If successful, send notification to (buffered) channel
			if state == core.StateSuccessful {
				out <- b
				log.WithFields(logrus.Fields{
					"b":    b,
					"host": s.cfg.Notifications.Host,
				}).Infoln("Notification message queued")
			}
		}
	}()

	return out
}

func (s *extractionRT) Subscribe() error {
	d, err := json.Marshal(&reqBodySub{
		JSONRPC: "2.0",
		ID:      1,
		Method:  method,
		Params:  []interface{}{},
	})
	if err != nil {
		return err
	}
	err = s.conn.WriteMessage(websocket.TextMessage, d)
	return err
}
