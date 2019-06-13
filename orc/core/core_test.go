package core

import (
	"context"
	"errors"
	"testing"

	"github.com/mongodb/mongo-go-driver/x/bsonx"
)

func TestDocumentsNotFound(t *testing.T) {
	table := []struct {
		param    error
		expected bool
	}{
		{param: errors.New("Something went wrong"), expected: false},
		{param: errors.New("mongo: no documents in result"), expected: true},
	}
	for _, row := range table {
		got := documentsNotFound(row.param)
		if got != row.expected {
			t.Errorf("Got %t, expected %t", got, row.expected)
		}
	}
}

func TestPipeline(t *testing.T) {
	ctx := context.Background()
	done := make(chan struct{})

	started := Start(ctx, done,
		func(ctx context.Context) (*bsonx.Doc, error) {
			d := bsonx.Doc{
				{Key: "key1", Value: bsonx.String("hello")},
			}
			return &d, nil
		},
	)
	terminated := Run(ctx, started,
		func(ctx context.Context, d1 *bsonx.Doc) (*bsonx.Doc, error) {
			d2 := d1.Append("key2", bsonx.String("world"))
			return &d2, nil
		},
	)
	merged := Merge(ctx, []<-chan *bsonx.Doc{terminated}...)

	go func() {
		close(done) // NOTE: Emulation of pipeline cancellation
	}()

	for d := range merged {
		key1, err := d.LookupElementErr("key1")
		if err != nil {
			t.Errorf("Error looking up element: %s", err)
		}
		value1, ok := key1.Value.StringValueOK()
		if !ok {
			t.Error("Invalid type for key1")
		}
		if value1 != "hello" {
			t.Errorf("Got %s, expected %s", value1, "hello")
		}

		key2, err := d.LookupElementErr("key2")
		if err != nil {
			t.Errorf("Error looking up element: %s", err)
		}
		value2, ok := key2.Value.StringValueOK()
		if !ok {
			t.Error("Invalid type for key2")
		}
		if value2 != "world" {
			t.Errorf("Got %s, expected %s", value2, "world")
		}
	} // NOTE: Must always terminate after first iteration
}
