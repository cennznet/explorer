package orcctx

import (
	"context"

	"github.com/sirupsen/logrus"
)

type key int

const loggerKey key = iota

var log *logrus.Logger

type utcFormatter struct {
	logrus.Formatter
}

func (u utcFormatter) Format(e *logrus.Entry) ([]byte, error) {
	e.Time = e.Time.UTC()
	return u.Formatter.Format(e)
}

func init() {
	log = logrus.New()
	log.SetFormatter(utcFormatter{&logrus.JSONFormatter{}})
}

func WithFields(ctx context.Context, fields logrus.Fields) context.Context {
	return context.WithValue(ctx, loggerKey, Get(ctx).WithFields(fields))
}

func Get(ctx context.Context) *logrus.Entry {
	if ctx != nil {
		if log, ok := ctx.Value(loggerKey).(*logrus.Entry); ok {
			return log
		}
	}
	return log.WithFields(logrus.Fields{})
}
