package config

import (
	"bytes"
	"testing"
)

func TestDBConnStr(t *testing.T) {
	table := []struct {
		param    []byte
		expected string
	}{
		{
			param:    []byte(`{"db":{"host":"localhost","port":5432,"username":"username","password":"password","name":"name"}}`),
			expected: "postgresql://username:password@localhost:5432/name",
		},
	}
	for _, row := range table {
		cfg, err := NewConfig(bytes.NewBuffer(row.param))
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
		}
		got := cfg.DBConnStr()
		if got != row.expected {
			t.Errorf("Got %s, expected %s", got, row.expected)
		}
	}
}

func TestWSProvider(t *testing.T) {
	table := []struct {
		param    []byte
		expected string
	}{
		{
			param:    []byte(`{"node":{"ws":"127.0.0.1:9944"}}`),
			expected: "ws://127.0.0.1:9944",
		},
	}
	for _, row := range table {
		cfg, err := NewConfig(bytes.NewBuffer(row.param))
		if err != nil {
			t.Errorf("Unexpected error: %s", err)
		}
		got := cfg.WSProvider()
		if got != row.expected {
			t.Errorf("Got %s, expected %s", got, row.expected)
		}
	}
}
