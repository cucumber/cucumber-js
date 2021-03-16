import { Server, Socket } from 'net'
import express from 'express'
import { pipeline, Writable } from 'stream'
import http from 'http'
import { promisify } from 'util'
import { doesHaveValue } from '../src/value_checker'

type Callback = (err?: Error | null) => void

/**
 * Fake implementation of the same report server that backs Cucumber Reports
 * (https://messages.cucumber.io). Used for testing only.
 */
export default class FakeReportServer {
  private readonly sockets = new Set<Socket>()
  private readonly server: Server
  private receivedBodies = Buffer.alloc(0)
  public receivedHeaders: http.IncomingHttpHeaders = {}

  constructor(private readonly port: number) {
    const app = express()

    app.put('/s3', (req, res) => {
      this.receivedHeaders = { ...this.receivedHeaders, ...req.headers }

      const captureBodyStream = new Writable({
        write: (chunk: Buffer, encoding: string, callback: Callback) => {
          this.receivedBodies = Buffer.concat([this.receivedBodies, chunk])
          callback()
        },
      })

      pipeline(req, captureBodyStream, (err) => {
        // TODO: remove temporary debug
        console.error('FakeServer::Res.end. Error?: ', err)
        if (doesHaveValue(err)) return res.status(500).end(err.stack)
        res.end('Do not display this response')
      })
    })

    app.get('/api/reports', (req, res) => {
      this.receivedHeaders = { ...this.receivedHeaders, ...req.headers }
      const token = extractAuthorizationToken(req.headers.authorization)
      if (token && !isValidUUID(token)) {
        res.status(401).end(`┌─────────────────────┐
│ Error invalid token │
└─────────────────────┘
`)
        return
      }

      res.setHeader('Location', `http://localhost:${port}/s3`)
      res.status(202)
        .end(`┌──────────────────────────────────────────────────────────────────────────┐
│ View your Cucumber Report at:                                            │
│ https://reports.cucumber.io/reports/f318d9ec-5a3d-4727-adec-bd7b69e2edd3 │
│                                                                          │
│ This report will self-destruct in 24h unless it is claimed or deleted.   │
└──────────────────────────────────────────────────────────────────────────┘
`)
    })

    this.server = http.createServer(app)

    this.server.on('connection', (socket) => {
      this.sockets.add(socket)
      socket.on('close', () => {
        // TODO: remove temporary debug
        console.error('FakeServer on close deleting sockets')
        this.sockets.delete(socket)
      })
    })
  }

  async start(): Promise<void> {
    const listen = promisify(this.server.listen.bind(this.server))
    await listen(this.port)
  }

  /**
   * @return all the received request bodies
   */
  async stop(): Promise<Buffer> {
    // TODO: remove temporary debug
    console.error('FakeServer: stop()')
    // Wait for all sockets to be closed
    await Promise.all(
      Array.from(this.sockets).map(
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        (socket) =>
          new Promise<void>((resolve, reject) => {
            // TODO: remove temporary debug
            console.error('socket destroyed?', socket.destroyed)
            if (socket.destroyed) return resolve()
            socket.on('close', resolve)
            socket.on('error', reject)
          })
      )
    )
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (doesHaveValue(err)) return reject(err)
        resolve(this.receivedBodies)
      })
    })
  }

  get started(): boolean {
    return this.server.listening
  }
}

function extractAuthorizationToken(
  authorizationHeader: string | undefined
): string | null {
  if (!authorizationHeader) return null

  const tokenMatch = authorizationHeader.match(/Bearer (.*)/)
  return tokenMatch ? tokenMatch[1] : null
}

function isValidUUID(token: string): boolean {
  const v4 = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  return v4.test(token)
}
