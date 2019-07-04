package config

import (
	"encoding/json"
	"fmt"
	"io"
)

const (
	dbSchema = "postgresql"
)

type configServer struct {
	Addr string `json:"addr"`
}

type configNode struct {
	WS string `json:"ws"`
}

type configQueue struct {
	URI  string `json:"uri"`
	Name string `json:"name"`
}

type configDB struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	Schema   string `json:"schema"`
	Name     string `json:"name"`
}

type configNotifications struct {
	Host string `json:"host"`
}

type configTaskWorkers struct {
	Block       int `json:"block"`
	Transaction int `json:"transaction"`
}

type Config struct {
	Server          *configServer        `json:"server"`
	Node            *configNode          `json:"node"`
	Queue           *configQueue         `json:"queue"`
	DB              *configDB            `json:"db"`
	Notifications   *configNotifications `json:"notifications"`
	TaskWorkers     *configTaskWorkers   `json:"taskWorkers"`
	RealTimeEnabled bool                 `json:"realTimeEnabled"`
}

func NewConfig(r io.Reader) (*Config, error) {
	cfg := new(Config)
	err := json.NewDecoder(r).Decode(cfg)
	if err != nil {
		return nil, err
	}
	return cfg, nil
}

func (cfg *Config) DBConnStr() string {
	return fmt.Sprintf(
		"%s://%s:%s@%s:%d/%s",
		dbSchema,
		cfg.DB.Username,
		cfg.DB.Password,
		cfg.DB.Host,
		cfg.DB.Port,
		cfg.DB.Name,
	)
}

func (cfg *Config) WSProvider() string {
	return fmt.Sprintf("%s", cfg.Node.WS)
}
