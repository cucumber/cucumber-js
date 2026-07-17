import http from 'node:http'
import net, { type Server } from 'node:net'

/**
 * Fake implementation of an HTTP proxy, as a user behind a corporate network
 * might have to publish reports through. Used for testing only.
 *
 * Handles both ways a proxy can be asked to relay a request, since which one
 * Node uses for a given target has varied across versions: an absolute-form
 * request that we forward on, or a CONNECT tunnel that we pipe through blindly.
 * Either way all we record is the target, as a tunnel is opaque to us.
 */
export default class FakeProxyServer {
  private readonly server: Server
  public proxiedTargets: string[] = []

  constructor(private readonly port: number) {
    this.server = http.createServer((req, res) => {
      const { hostname, port, pathname, search } = new URL(req.url)
      this.proxiedTargets.push(`${hostname}:${port}`)
      const forwarded = http.request(
        {
          host: hostname,
          port,
          path: pathname + search,
          method: req.method,
          headers: req.headers,
        },
        (targetRes) => {
          res.writeHead(targetRes.statusCode, targetRes.headers)
          targetRes.pipe(res)
        }
      )
      forwarded.on('error', (err) => res.writeHead(502).end(err.message))
      req.pipe(forwarded)
    })

    this.server.on('connect', (req, clientSocket, head) => {
      this.proxiedTargets.push(req.url)
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
