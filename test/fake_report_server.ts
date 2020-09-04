import { Server, Socket } from 'net'
import express from 'express'
import { pipeline, Writable } from 'stream'
import http from 'http'
import { promisify } from 'util'

type Callback = (err?: Error | null) => void

/**
 * Fake implementation of the same report server that backs Cucumber Reports
 * (https://messages.cucumber.io). Used for testing only.
 */
export default class FakeReportServer {
  private readonly sockets = new Set<Socket>()
  private readonly server: Server
  private receivedBodies = Buffer.alloc(0)

  constructor(private readonly port: number) {
    const app = express()

    app.put('/s3', (req, res) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const server = this
      const captureBodyStream = new Writable({
        write(chunk: Buffer, encoding: string, callback: Callback) {
          server.receivedBodies = Buffer.concat([server.receivedBodies, chunk])
          callback()
        },
      })

      pipeline(req, captureBodyStream, (err) => {
        if (err !== null && err !== undefined)
          return res.status(500).end(err.stack)
        res.end()
      })
    })

    app.get('/api/reports', (req, res) => {
      res.setHeader('Location', `http://localhost:${port}/s3`)
      res.status(202).end(`┌──────────────────────────────────────────────────────────────────────────┐
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
    // Wait for all sockets to be closed
    await Promise.all(
      Array.from(this.sockets).map(
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        (socket) =>
          new Promise((resolve, reject) => {
            if (socket.destroyed) return resolve()
            socket.on('close', resolve)
            socket.on('error', reject)
          })
      )
    )
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err !== null && err !== undefined) return reject(err)
        resolve(this.receivedBodies)
      })
    })
  }

  get started(): boolean {
    return this.server.listening
  }
}
