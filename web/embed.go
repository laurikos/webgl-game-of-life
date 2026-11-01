package web

import (
	"embed"
	"io/fs"
)

//go:embed index.html app.js shaders.js styles.css
var content embed.FS

// Content contains only the public assets, excluding Go source and future files.
func Content() fs.FS {
	return content
}
