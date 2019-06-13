package model

import (
	"time"

	"github.com/cennznet/explorer/orc/core"
	"github.com/mongodb/mongo-go-driver/bson/primitive"
	"github.com/mongodb/mongo-go-driver/x/bsonx"
)

func FindReady(now time.Time) bsonx.Doc {
	return bsonx.Doc{
		{Key: "taskInfo.state", Value: bsonx.String(core.StateReady)},
		{Key: "taskInfo.processAfter", Value: bsonx.Document(bsonx.Doc{{Key: "$lt", Value: bsonx.Time(now)}})},
	}
}

func FindByOID(oid primitive.ObjectID) bsonx.Doc {
	return bsonx.Doc{
		{Key: "_id", Value: bsonx.ObjectID(oid)},
	}
}

func MarkAsStarted(now time.Time) bsonx.Doc {
	return bsonx.Doc{{Key: "$set", Value: bsonx.Document(bsonx.Doc{
		{Key: "taskInfo.state", Value: bsonx.String(core.StateStarted)},
		{Key: "taskInfo.lastUpdated", Value: bsonx.Time(now)},
	})}}
}

func MarkAsFailed(now time.Time, errorReason string) bsonx.Doc {
	return bsonx.Doc{{Key: "$set", Value: bsonx.Document(bsonx.Doc{
		{Key: "taskInfo.state", Value: bsonx.String(core.StateFailed)},
		{Key: "taskInfo.lastUpdated", Value: bsonx.Time(now)},
		{Key: "taskInfo.errorReason", Value: bsonx.String(errorReason)},
	})}}
}

func MarkAsSuccessful(now time.Time) bsonx.Doc {
	return bsonx.Doc{{Key: "$set", Value: bsonx.Document(bsonx.Doc{
		{Key: "taskInfo.state", Value: bsonx.String(core.StateSuccessful)},
		{Key: "taskInfo.lastUpdated", Value: bsonx.Time(now)},
	})}}
}

func (t *bkTask) FindByBlockNumber() bsonx.Doc {
	return bsonx.Doc{
		{Key: "args.b", Value: bsonx.Int64(t.Args.B)},
	}
}

func (t *bkTask) Upsert() bsonx.Doc {
	return bsonx.Doc{
		{
			Key: "$set", Value: bsonx.Document(bsonx.Doc{
				{Key: "taskInfo.state", Value: bsonx.String(t.TaskInfo.State)},
				{Key: "taskInfo.lastUpdated", Value: bsonx.Time(t.TaskInfo.LastUpdated)},
				{Key: "taskInfo.errorReason", Value: bsonx.String("")},
			}),
		},
		{
			Key: "$setOnInsert", Value: bsonx.Document(bsonx.Doc{
				{Key: "taskInfo.priority", Value: bsonx.Int64(t.TaskInfo.Priority)},
				{Key: "taskInfo.processAfter", Value: bsonx.Time(t.TaskInfo.LastUpdated)},
				{Key: "taskInfo.created", Value: bsonx.Time(t.TaskInfo.LastUpdated)},
				{Key: "args.b", Value: bsonx.Int64(t.Args.B)},
			}),
		},
	}
}
