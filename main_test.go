package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPublicRoutes(t *testing.T) {
	handler := newHTTPServer("").Handler
	for _, tc := range []struct {
		path    string
		status  int
		content string
	}{
		{"/", http.StatusOK, "<title>game-of-life</title>"},
		{"/healthz", http.StatusOK, ""},
		{"/app.js", http.StatusOK, ""},
		{"/shaders.js", http.StatusOK, ""},
		{"/styles.css", http.StatusOK, ""},
		{"/embed.go", http.StatusNotFound, ""},
		{"/missing", http.StatusNotFound, ""},
	} {
		t.Run(tc.path, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, tc.path, nil))
			if response.Code != tc.status {
				t.Fatalf("status = %d, want %d", response.Code, tc.status)
			}
			if !strings.Contains(response.Body.String(), tc.content) {
				t.Fatalf("response does not contain %q", tc.content)
			}
		})
	}
}

func TestReverseProxyPrefixes(t *testing.T) {
	for _, prefix := range []string{"/gol", "/game-of-life-webgl"} {
		t.Run(prefix, func(t *testing.T) {
			handler := http.StripPrefix(prefix, newHTTPServer("").Handler)
			for _, path := range []string{"/", "/app.js", "/shaders.js", "/styles.css"} {
				response := httptest.NewRecorder()
				handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, prefix+path, nil))
				if response.Code != http.StatusOK {
					t.Errorf("%s%s: status = %d", prefix, path, response.Code)
				}
			}
		})
	}
}

func TestServeReturnsListenError(t *testing.T) {
	if err := serve(context.Background(), newHTTPServer("invalid-address")); err == nil {
		t.Fatal("expected invalid listener address to fail")
	}
}

func TestServeHandlesShutdownBeforeListen(t *testing.T) {
	server := newHTTPServer("")
	if err := server.Shutdown(context.Background()); err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if err := serve(ctx, server); err != nil {
		t.Fatalf("already stopped server: %v", err)
	}
}
