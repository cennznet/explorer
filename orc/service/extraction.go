package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	config "github.com/cennznet/explorer/orc/cfg"
	"github.com/cennznet/explorer/orc/core"
	"github.com/cennznet/explorer/orc/model"
	"github.com/go-cmd/cmd"
	"github.com/mongodb/mongo-go-driver/mongo"
	"github.com/mongodb/mongo-go-driver/mongo/options"
	"github.com/mongodb/mongo-go-driver/x/bsonx"
	"github.com/sirupsen/logrus"
)

type extraction struct {
	log   *logrus.Entry
	cfg   *config.Config
	queue *mongo.Collection
}

func NewExtraction(log *logrus.Entry, cfg *config.Config,
	queue *mongo.Collection) *extraction {
	return &extraction{
		log:   log,
		cfg:   cfg,
		queue: queue,
	}
}

func (s *extraction) StartBkTask(ctx context.Context) (*bsonx.Doc, error) {
	now := time.Now().UTC()
	filter := model.FindReady(now)
	update := model.MarkAsStarted(now)

	opts := options.FindOneAndUpdate()
	opts = opts.SetSort(map[string]interface{}{
		"taskInfo.state":        1,
		"taskInfo.priority":     1,
		"taskInfo.processAfter": 1,
	})
	opts = opts.SetReturnDocument(options.After)

	var result bsonx.Doc
	err := s.queue.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result)
	return &result, err
}

func (s *extraction) processBkTask(b int64) error {
	// NOTE: Alternatively, we can invoke a Lambda function or some
	// external microservice via HTTP
	command := cmd.NewCmd(
		"node", "dist/export_all.js",
		"-b", fmt.Sprintf("%d", b),
		"-p", s.cfg.WSProvider(),
		"-o", s.cfg.DBConnStr(),
		"-s", s.cfg.DB.Schema,
	)
	status := <-command.Start()
	if status.Error != nil {
		return status.Error
	} else if status.Exit != 0 {
		return errors.New(strings.Join(status.Stderr, "\n"))
	} else if !status.Complete {
		return errors.New("Process stopped or signaled")
	}
	return nil
}

func (s *extraction) RunBkTask(ctx context.Context, d *bsonx.Doc) (*bsonx.Doc, error) {
	log := s.log

	key1 := []string{"_id"}
	elem1, err := d.LookupElementErr(key1...)
	if err != nil {
		return nil, err
	}
	oid, ok := elem1.Value.ObjectIDOK()
	if !ok {
		return nil, fmt.Errorf("Invalid type for %s", elem1.Key)
	}

	key2 := []string{"args", "b"}
	elem2, err := d.LookupElementErr(key2...)
	if err != nil {
		return nil, err
	}
	b, ok := elem2.Value.Int64OK()
	if !ok {
		return nil, fmt.Errorf("Invalid type for %s", elem2.Key)
	}

	key3 := []string{"taskInfo", "priority"}
	elem3, err := d.LookupElementErr(key3...)
	if err != nil {
		return nil, err
	}
	priority, ok := elem3.Value.Int64OK()
	if !ok {
		return nil, fmt.Errorf("Invalid type for %s", elem3.Key)
	}

	log = log.WithFields(logrus.Fields{
		elem1.Key: oid.Hex(),
		elem2.Key: b,
		elem3.Key: priority,
	})

	filter := model.FindByOID(oid)

	var update bsonx.Doc

	log.Infoln("Extracting block...")
	err = s.processBkTask(b)
	if err != nil {
		log.Errorf("Error processing block task: %s", err)
		update = model.MarkAsFailed(time.Now().UTC(), err.Error())
	} else {
		log.Infoln("Block successfully extracted")
		update = model.MarkAsSuccessful(time.Now().UTC())
	}

	opts := options.FindOneAndUpdate()
	opts = opts.SetReturnDocument(options.After)

	var result bsonx.Doc
	err = s.queue.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result)
	return &result, err
}

func (s *extraction) SummariseBkTask(d *bsonx.Doc) (string, error) {
	log := s.log

	key1 := []string{"_id"}
	elem1, err := d.LookupElementErr(key1...)
	if err != nil {
		return "", err
	}
	oid, ok := elem1.Value.ObjectIDOK()
	if !ok {
		return "", fmt.Errorf("Invalid type for %s", elem1.Key)
	}

	key2 := []string{"args", "b"}
	elem2, err := d.LookupElementErr(key2...)
	if err != nil {
		return "", err
	}
	b, ok := elem2.Value.Int64OK()
	if !ok {
		return "", fmt.Errorf("Invalid type for %s", elem2.Key)
	}

	key3 := []string{"taskInfo", "state"}
	elem3, err := d.LookupElementErr(key3...)
	if err != nil {
		return "", err
	}
	state, ok := elem3.Value.StringValueOK()
	if !ok {
		return "", fmt.Errorf("Invalid type for %s", elem3.Key)
	}

	key4 := []string{"taskInfo", "priority"}
	elem4, err := d.LookupElementErr(key4...)
	if err != nil {
		return "", err
	}
	priority, ok := elem4.Value.Int64OK()
	if !ok {
		return "", fmt.Errorf("Invalid type for %s", elem4.Key)
	}

	log.WithFields(logrus.Fields{
		"coll":    core.CollBkTask,
		elem1.Key: oid.Hex(),
		elem2.Key: b,
		elem3.Key: state,
		elem4.Key: priority,
	}).Infoln("Task complete")

	return state, nil
}
