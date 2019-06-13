package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	config "github.com/cennznet/explorer/orc/cfg"
	"github.com/sirupsen/logrus"
)

type blockMessage struct {
	BlockNumber int64 `json:"blockNumber"`
}

type blockNotification struct {
	log *logrus.Entry
	cfg *config.Config
}

func (s *blockNotification) SendMessage(ctx context.Context, blockNumber int64) error {
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	msg := blockMessage{BlockNumber: blockNumber}
	data, err := json.Marshal(&msg)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(
		http.MethodPost,
		s.cfg.Notifications.Host,
		bytes.NewBuffer(data),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	req = req.WithContext(ctx)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK, http.StatusCreated:
	default:
		return fmt.Errorf("Status: %d", resp.StatusCode)
	}

	return nil
}

func (s *blockNotification) Notify(ctx context.Context, bns <-chan int64) <-chan struct{} {
	out := make(chan struct{})

	log := s.log
	go func() {
		defer close(out)
		for bn := range bns {
			if s.cfg.Notifications.Host == "" {
				continue
			}

			log = log.WithFields(logrus.Fields{"b": bn})
			if err := s.SendMessage(ctx, bn); err != nil {
				log.Errorf("Error sending notification message: %s", err)
				continue
			}
			log.Infoln("Notification message sent")
		}
	}()

	return out
}

func NewBlockNotification(log *logrus.Entry, cfg *config.Config) *blockNotification {
	return &blockNotification{
		log: log.WithFields(logrus.Fields{"host": cfg.Notifications.Host}),
		cfg: cfg,
	}
}
