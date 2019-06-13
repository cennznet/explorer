package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"time"

	config "github.com/cennznet/explorer/orc/cfg"
	"github.com/cennznet/explorer/orc/core"
	logger "github.com/cennznet/explorer/orc/logger"
	"github.com/cennznet/explorer/orc/model"
	"github.com/mongodb/mongo-go-driver/mongo"
	"github.com/mongodb/mongo-go-driver/mongo/options"
	"github.com/mongodb/mongo-go-driver/x/bsonx"
	"github.com/sirupsen/logrus"
)

var (
	start    = flag.Int64("start", 1, "Start block number")
	end      = flag.Int64("end", 1, "End block number")
	reversed = flag.Bool("reversed", false, "Insert blocks from end to start if enabled")
	filename = flag.String("config", "config.json", "Path to config file")
	priority = flag.Int64("priority", 2, "Task priority (the lower the higher)")
)

func upsertTask(ctx context.Context, log *logrus.Entry,
	queue *mongo.Collection, priority, b int64) error {
	now := time.Now().UTC()
	t := model.NewBkTask(now, priority, b, core.StateReady)

	filter := t.FindByBlockNumber()
	update := t.Upsert()

	opts := options.FindOneAndUpdate()
	opts = opts.SetUpsert(true)
	opts = opts.SetReturnDocument(options.After)

	var result bsonx.Doc
	err := queue.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result)
	if err != nil {
		return fmt.Errorf("Error upserting task: %s", err)
	}

	key1 := []string{"_id"}
	elem1, err := result.LookupElementErr(key1...)
	if err != nil {
		return fmt.Errorf("Error looking up element: %s", err)
	}
	oid, ok := elem1.Value.ObjectIDOK()
	if !ok {
		return fmt.Errorf("Invalid type for %s", elem1.Key)
	}
	log.WithFields(logrus.Fields{
		elem1.Key:  oid.Hex(),
		"b":        b,
		"priority": priority,
	}).Println("Task upserted")

	return nil
}

func main() {
	flag.Parse()

	ctx := context.Background()
	ctx = logger.WithFields(ctx, logrus.Fields{"pid": os.Getpid()})
	log := logger.Get(ctx)

	f, err := os.Open(*filename)
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
			log.Fatalf("Error disconnecting from MongoDB: %s", err)
		}
	}()
	queue := mc.Database(cfg.Queue.Name).Collection(core.CollBkTask)

	if *reversed {
		for b := *end; b >= *start; b-- {
			err = upsertTask(ctx, log, queue, *priority, b)
			if err != nil {
				log.Fatalln(err)
			}
		}
		return
	}

	for b := *start; b <= *end; b++ {
		err = upsertTask(ctx, log, queue, *priority, b)
		if err != nil {
			log.Fatalln(err)
		}
	}
}
