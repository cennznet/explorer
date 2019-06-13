package core

import (
	"context"
	"math/rand"
	"sync"
	"time"

	logger "github.com/cennznet/explorer/orc/logger"
	"github.com/mongodb/mongo-go-driver/x/bsonx"
)

const (
	// Database collections
	CollBkTask = "blockTask"
	CollTxTask = "transactionTask"

	// Task states
	StateReady      = "ready"
	StateStarted    = "started"
	StateFailed     = "failed"
	StateSuccessful = "successful"
)

type starter func(ctx context.Context) (*bsonx.Doc, error)
type runner func(ctx context.Context, d *bsonx.Doc) (*bsonx.Doc, error)

func randomBetween(min, max time.Duration) time.Duration {
	return time.Duration(rand.Intn(1e3))*time.Millisecond*(max-min) + time.Duration(min*time.Second)
}

func documentsNotFound(err error) bool {
	return err.Error() == "mongo: no documents in result"
}

func Start(ctx context.Context, done <-chan struct{}, fn starter) <-chan *bsonx.Doc {
	out := make(chan *bsonx.Doc)
	go func() {
		defer close(out)
		log := logger.Get(ctx)
		for {
			select {
			case <-done:
				return
			default:
				d, err := fn(ctx)
				if err != nil {
					if !documentsNotFound(err) {
						log.Errorf("Error starting task: %s", err)
					}
					time.Sleep(randomBetween(2, 3)) // Retry after 2 to 3 seconds
					continue
				}
				out <- d
			}
		}
	}()
	return out
}

func Run(ctx context.Context, in <-chan *bsonx.Doc, fn runner) <-chan *bsonx.Doc {
	out := make(chan *bsonx.Doc)
	go func() {
		defer close(out)
		log := logger.Get(ctx)
		for d := range in {
			d, err := fn(ctx, d)
			if err != nil {
				log.Errorf("Error running task: %s", err)
				continue
			}
			out <- d
		}
	}()
	return out
}

func Merge(ctx context.Context, ins ...<-chan *bsonx.Doc) <-chan *bsonx.Doc {
	out := make(chan *bsonx.Doc)
	go func() {
		defer close(out)

		var wg sync.WaitGroup
		wg.Add(len(ins))

		fn := func(in <-chan *bsonx.Doc) {
			defer wg.Done()
			for d := range in {
				out <- d
			}
		}

		for _, in := range ins {
			go fn(in)
		}

		wg.Wait()
	}()
	return out
}
