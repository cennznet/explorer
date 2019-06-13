package model

import "time"

type taskInfo struct {
	State        string    `bson:"state"`
	Priority     int64     `bson:"priority"`
	ProcessAfter time.Time `bson:"processAfter"`
	Created      time.Time `bson:"created"`
	LastUpdated  time.Time `bson:"lastUpdated"`
	ErrorReason  string    `bson:"errorReason"`
}

type bkTaskArgs struct {
	B int64 `bson:"b"`
}

type bkTask struct {
	TaskInfo *taskInfo   `bson:"taskInfo"`
	Args     *bkTaskArgs `bson:"args"`
}

func NewBkTask(now time.Time, priority, b int64, state string) *bkTask {
	return &bkTask{
		TaskInfo: &taskInfo{
			State:        state,
			Priority:     priority,
			ProcessAfter: now,
			Created:      now,
			LastUpdated:  now,
		},
		Args: &bkTaskArgs{
			B: b,
		},
	}
}
