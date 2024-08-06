# My WebGL2 implementation of Conway's Game of Life

---

_should_ be running [here](https://laurikos.net/game-of-life-webgl/index.html)

url: `https://laurikos.net/game-of-life-webgl/index.html`

---

This is something that I've done in learning purpose;

- Wanted to use WebGL
- Tried to do as much as possible with shaders

Just learning purpose project that is now enhanced by serving it with Go server which
embeds the web page files and is deployable just as one binary.

And published to my domain for showcasing and so that I can have more content
on my github..

---

### Build and start serving:

compile the binary and start serving at port ":9889"

```sh
$ go build -o ./bin/game-of-life-server ./main.go

$ cd ./bin
$ ./game-of-life-server --addr=":9889"


```
