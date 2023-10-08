import { Server } from 'node:net'
import { pipeline, Writable } from 'node:stream'
import http from 'node:http'
import express from 'express'
import { doesHaveValue } from '../src/value_checker'

type Callback = (err?: Error | null) => void

/**
 * Fake implementation of the same report server that backs Cucumber Reports
 * (https://messages.cucumber.io). Used for testing only.
 */
export default class FakeReportServer {
  private readonly server: Server
  public receivedBodies = Buffer.alloc(0)
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
        if (doesHaveValue(err)) {
          res.status(500).end(err.stack)
          return
        }

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

      res.setHeader('Location', `http://localhost:${this.port}/s3`)
      res.status(202)

      res.end(`┌──────────────────────────────────────────────────────────────────────────┐
│ View your Cucumber Report at:                                            │
│ https://reports.cucumber.io/reports/f318d9ec-5a3d-4727-adec-bd7b69e2edd3 │
│                                                                          │
│ This report will self-destruct in 24h unless it is claimed or deleted.   │
└──────────────────────────────────────────────────────────────────────────┘
`)
    })

    this.server = http.createServer(app)
  }

  async start(): Promise<void> {
    return new Promise((resolve) =>
      this.server.listen(this.port, () => resolve())
    )
  }

  /**
   * @return all the received request bodies
   */
  async stop(): Promise<Buffer> {
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
  const v4 =
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  return v4.test(token)
}
