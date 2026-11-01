# My WebGL2 implementation of Conway's Game of Life

---

_should_ be running [here](https://laurikos.net/game-of-life-webgl/index.html)

url: `https://laurikos.net/game-of-life-webgl/index.html`

---

### What and why

This is something that I've done in learning purpose;

- Wanted to use WebGL (my first time)
- Tried to do as much as possible with shaders

Just learning purpose project that is now enhanced by serving it with Go server which
embeds the web page files and is deployable just as one binary.

And published to my domain for showcasing and so that I can have more content
on my github..

### Update @ 2026-11-01

Let AI do some maintaining

---

### Build and run

Use Go 1.27.3 or newer. This project uses only the standard library; the browser
assets are embedded in the executable.

```sh
make test
make build
./bin/game-of-life-server --addr=127.0.0.1:9000
```

The default address is `127.0.0.1:9000`, for use behind nginx or Caddy. Override it
explicitly when remote access to the application port is needed. `/healthz` returns
HTTP 200. SIGINT and SIGTERM stop the server with a 10-second graceful-shutdown
deadline.

### Build on a Mac for a Linux x86-64 server

The installed Go toolchain can cross-compile this pure-Go application; a separate
x86 Go installation is not required.

```sh
make linux
file bin/game-of-life-server-linux-amd64
scp bin/game-of-life-server-linux-amd64 ADMIN@SERVER:/tmp/game-of-life-server
```

This produces a Linux/amd64 executable with cgo disabled and a baseline x86-64
CPU target. It needs no Go installation or shared application libraries on the
server. It cannot run directly on macOS; run `make test` natively and smoke-test
the Linux build on the target before switching traffic.

### Run as a systemd service

`deploy/game-of-life.service` runs the installed binary as an unprivileged dynamic
user, restarts it on failure, and listens only on loopback. Install the executable
at `/opt/game-of-life/game-of-life-server` and the unit at
`/etc/systemd/system/game-of-life.service`, then reload systemd and enable/start
the service. Keep the previous binary for rollback.

Before starting on an existing server, arrange the cutover from any process already
using port 9000; do not start two listeners on that port. The current nginx paths
`/gol/` and `/game-of-life-webgl/` strip their prefixes before forwarding to port 9000. Preserve that behavior and the trailing slash when moving to another proxy.
The HTML uses relative asset URLs, so both paths work with prefix stripping.
