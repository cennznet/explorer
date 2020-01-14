package main

import (
	"context"
	"net/http"
	"crypto/tls"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	config "github.com/cennznet/explorer/orc/cfg"
	"github.com/cennznet/explorer/orc/core"
	logger "github.com/cennznet/explorer/orc/logger"
	"github.com/cennznet/explorer/orc/server"
	"github.com/cennznet/explorer/orc/service"
	"github.com/gorilla/websocket"
	"github.com/mongodb/mongo-go-driver/mongo"
	"github.com/mongodb/mongo-go-driver/x/bsonx"
	"github.com/sirupsen/logrus"
)

func main() {
	// Init

	ctx := context.Background()

	ctx = logger.WithFields(ctx, logrus.Fields{"pid": os.Getpid()})
	log := logger.Get(ctx)

	if len(os.Args) < 2 {
		log.Fatalf("Must provide config file as first arg")
	}
	filename := os.Args[1]

	f, err := os.Open(filename)
	if err != nil {
		log.Fatalf("Error opening config file: %s", err)
	}
	cfg, err := config.NewConfig(f)
	if err != nil {
		log.Fatalf("Error reading config from file: %s", err)
	}

	mc, err := mongo.NewClient(cfg.Queue.URI)
	if err != nil {
		log.Fatalf("Error creating MongoDB client: %s", err)
	}
	err = mc.Connect(ctx)
	if err != nil {
		log.Fatalf("Error connecting to MongoDB: %s", err)
	}
	defer func() {
		err = mc.Disconnect(ctx)
		if err != nil {
			log.Errorf("Error disconnecting from MongoDB: %s", err)
		}
	}()
	queue := mc.Database(cfg.Queue.Name).Collection(core.CollBkTask)

	log.WithFields(logrus.Fields{
		"node.ws":                 cfg.Node.WS,
		"db.host":                 cfg.DB.Host,
		"db.schema":               cfg.DB.Schema,
		"taskWorkers.block":       cfg.TaskWorkers.Block,
		"taskworkers.transaction": cfg.TaskWorkers.Transaction,
		"notifications.host":      cfg.Notifications.Host,
	}).Infoln("newhead started")

	// Web server

	s := &http.Server{Addr: cfg.Server.Addr, Handler: server.NewServer()}
	defer func() {
		ctx, cf := context.WithTimeout(ctx, 5*time.Second)
		defer cf()
		log.Infoln("Shutting down server gracefully...")
		if err := s.Shutdown(ctx); err != nil {
			log.Errorf("Error shutting down gracefully: %s", err)
			return
		}
		log.Infoln("Server shut down gracefully")
	}()

	go func() {
		log.Infoln("Starting server...")
		if err := s.ListenAndServe(); err != http.ErrServerClosed {
			log.Errorf("Server error: %s", err)
		}
	}()

	// Services
	extraction := service.NewExtraction(log, cfg, queue)

	// Pipeline
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)

	// Set up non-RT extraction (multi-threaded with parallel workers)
	done2 := make(chan struct{})
	bkTasksStarted := core.Start(ctx, done2, extraction.StartBkTask)
	var bkTasksTerminated []<-chan *bsonx.Doc
	for i := 0; i < cfg.TaskWorkers.Block; i++ {
		bkTasksTerminated = append(bkTasksTerminated,
			core.Run(ctx, bkTasksStarted, extraction.RunBkTask))
	}
	bkTasksMerged := core.Merge(ctx, bkTasksTerminated...)

	// Realtime
	if cfg.RealTimeEnabled {
		u, err := url.Parse(cfg.Node.WS)
		if err != nil {
			log.Fatalf("Error parsing web socket url: %s", err)
		}
		d := websocket.Dialer{TLSClientConfig: &tls.Config{InsecureSkipVerify : true}}
		conn, _, err := d.Dial(
			u.String(),
			http.Header{"Content-Type": []string{"application/json"}},
		)
		if err != nil {
			log.Fatalf("Error dialing %s: %s", u.String(), err)
		}
		defer func() {
			err = conn.Close()
			if err != nil {
				log.Errorf("Error closing WS connection: %s", err)
			}
		}()
		// Services
		extractionRT := service.NewExtractionRT(log, cfg, conn, queue)
		notifications := service.NewBlockNotification(log, cfg)

		// Set up real-time extraction (single-threaded)
		received := extractionRT.Receive(ctx)
		scheduled := extractionRT.Schedule(ctx, received)
		extracted := extractionRT.Extract(ctx, scheduled)
		done := notifications.Notify(ctx, extracted)
		// Subscribe to new head only if real-time extraction is enabled
		err = extractionRT.Subscribe()
		if err != nil {
			log.Fatalf("Error subscribing to channel: %s", err)
		}
		go func() {
			defer close(done2)
			for {
				select {
				case <-done:
					return
				case <-interrupt:
					log.Warnln("Interrupted. Terminating gracefully...")
					if cfg.RealTimeEnabled {
						err := conn.WriteMessage(websocket.CloseMessage,
							websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
						if err != nil {
							log.Errorf("Error closing WS connection: %s", err)
							return
						}
					}
					// Soft shutdown before hard shutdown after 5 seconds
					select {
					case <-time.After(time.Second * 5):
					}
					return
				}
			}
		}()
	} else {
		go func() {
			defer close(done2)
			for {
				select {
				case <-interrupt:
					log.Warnln("Interrupted. Terminating gracefully...")
					// Soft shutdown before hard shutdown after 5 seconds
					select {
					case <-time.After(time.Second * 5):
					}
					return
				}
			}
		}()
	}

	// Terminated upon closing done2 channel above
	for d := range bkTasksMerged {
		_, err = extraction.SummariseBkTask(d)
		if err != nil {
			log.Errorf("Error summarising block task: %s", err)
		}
	}

	log.Infoln("All workers terminated. Exiting...")
}
