import http from 'node:http'
import net, { type Server } from 'node:net'

/**
 * Fake implementation of an HTTP proxy, as a user behind a corporate network
 * might have to publish reports through. Used for testing only.
 *
 * Node tunnels proxied requests with CONNECT even when the target is plain
 * http, so the payloads pass through opaquely and all we can observe is which
 * targets were tunnelled to.
 */
export default class FakeProxyServer {
  private readonly server: Server
  public tunnelledTargets: string[] = []

  constructor(private readonly port: number) {
    this.server = http.createServer((_req, res) => {
      // we only expect CONNECT, so anything else is a mistake worth surfacing
      res.writeHead(501).end()
    })

    this.server.on('connect', (req, clientSocket, head) => {
      this.tunnelledTargets.push(req.url)
      const { hostname, port } = new URL(`http://${req.url}`)
      const targetSocket = net.connect(parseInt(port, 10), hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
        targetSocket.write(head)
        targetSocket.pipe(clientSocket)
        clientSocket.pipe(targetSocket)
      })
      targetSocket.on('error', () => clientSocket.end())
      clientSocket.on('error', () => targetSocket.end())
    })
  }

  async start(): Promise<void> {
    return new Promise((resolve) => this.server.listen(this.port, () => resolve()))
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => (err ? reject(err) : resolve()))
    })
  }

  get started(): boolean {
    return this.server.listening
  }
}
