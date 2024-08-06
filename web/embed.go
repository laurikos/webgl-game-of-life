package web

import "embed"

//go:embed *
var embededFiles embed.FS

type ServeContent struct {
	GameOfLife embed.FS
}

func NewServeContent() *ServeContent {
	return &ServeContent{
		GameOfLife: embededFiles,
	}
}

func (s *ServeContent) GetContent() embed.FS {
	return s.GameOfLife
}
