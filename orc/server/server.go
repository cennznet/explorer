package server

import "net/http"

type server struct {
	router *http.ServeMux
}

func NewServer() *server {
	s := &server{
		router: http.NewServeMux(),
	}

	s.router.HandleFunc("/", auth(index()))

	return s
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func auth(h http.HandlerFunc) http.HandlerFunc {
	// NOTE: Placeholder for auth
	return func(w http.ResponseWriter, r *http.Request) {
		h(w, r)
	}
}

func index() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}
}
