import { AddressInfo, Server, Socket } from 'net'
import express from 'express'
import { pipeline, Writable } from 'stream'
import http from 'http'
import { doesHaveValue } from '../src/value_checker'
import * as core from 'express-serve-static-core'
import { createHttpTerminator, HttpTerminator } from 'http-terminator'

type Callback = (err?: Error | null) => void

/**
 * Fake implementation of the same report server that backs Cucumber Reports
 * (https://messages.cucumber.io). Used for testing only.
 */
export default class FakeReportServer {
  private receivedBodies = Buffer.alloc(0)
  private app: core.Express
  public receivedHeaders: http.IncomingHttpHeaders = {}
  private terminator: HttpTerminator

  constructor(private port: number) {
    this.app = express()

    this.app.put('/s3', (req, res) => {
      this.receivedHeaders = { ...this.receivedHeaders, ...req.headers }

      const captureBodyStream = new Writable({
        write: (chunk: Buffer, encoding: string, callback: Callback) => {
          this.receivedBodies = Buffer.concat([this.receivedBodies, chunk])
          callback()
        },
      })

      pipeline(req, captureBodyStream, (err) => {
        if (doesHaveValue(err)) return res.status(500).end(err.stack)
        res.end('Do not display this response')
      })
    })

    this.app.get('/api/reports', (req, res) => {
      console.log('FakeReportServer: received HTTP request to /api/reports')
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
  }

  async start(): Promise<number> {
    console.log(`FakeReportServer.start()`)
    console.log('FakeReportServer: creating new server')
    const server = http
      .createServer(this.app)
      .on('error', (err) => console.warn('SERVER ERROR: ', err))
      .on('clientError', (err) => console.warn('SERVER CLIENT ERROR: ', err))
    await new Promise((resolve, reject) => {
      server.on('error', reject)
      server.on('listening', resolve)
      server.listen(this.port)
    })
    console.log(`FakeReportServer.start(): now listening on ${this.port}`)
    this.port = (server.address() as AddressInfo).port
    this.terminator = createHttpTerminator({
      server,
    })
    return this.port
  }

  /**
   * @return all the received request bodies
   */
  async stop(): Promise<Buffer> {
    await this.terminator.terminate()
    return this.receivedBodies
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
