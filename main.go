package main

import (
	"context"
	"embed"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/laurikos/webgl-game-of-life/web"
)

type HTTPServer struct {
	srv     *http.Server
	content embed.FS
}

func newHTTPServer(addr string) *HTTPServer {
	webContents := web.NewServeContent()
	server := HTTPServer{
		content: webContents.GetContent(),
	}

	s := http.Server{
		Addr:           addr,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		IdleTimeout:    120 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", server.serveWebContent)
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	s.Handler = mux

	server.srv = &s

	return &server

}

func (server *HTTPServer) serveWebContent(w http.ResponseWriter, r *http.Request) {

	http.FileServer(http.FS(server.content)).ServeHTTP(w, r)

}

func (server *HTTPServer) Start() error {
	idleConnsClosed := make(chan struct{})
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt)
		<-sigint

		if err := server.srv.Shutdown(context.Background()); err != nil {
			log.Printf("HTTP server Shutdown: %v", err)
		}
		close(idleConnsClosed)

	}()

	log.Printf("Starting serving web contents on %s", server.srv.Addr)

	if err := server.srv.ListenAndServe(); err != http.ErrServerClosed {
		return err
	}

	<-idleConnsClosed

	return nil
}

var flagServeAddr string

func parseFlags() {

	flag.StringVar(&flagServeAddr, "addr", ":9000", "address to serve the web content")

	flag.Parse()

}

func main() {

	parseFlags()

	server := newHTTPServer(flagServeAddr)

	if err := server.Start(); err != nil {
		log.Fatalf("Failed to start HTTP server: %v", err)
	}

	log.Printf("HTTP server stopped")

}
