import http from 'http'
import { Server } from 'net'
import { Writable } from 'stream'
import express from 'express'
import fs from 'fs'
import { promisify } from 'util'
import tmp from 'tmp'
import assert from 'assert'
import { URL } from 'url'
import bodyParser from 'body-parser'

class ReportServer {
  private readonly server: Server
  public readonly bodies: Buffer[] = []

  constructor(private readonly port: number) {
    const app = express()
    app.use(bodyParser.raw({ type: () => true }))

    app.put('/s3', (req, res) => {
      const body: Buffer = req.body
      this.bodies.push(body)
      res.end()
    })

    this.server = http.createServer(app)
  }

  async start(): Promise<void> {
    const listen = promisify(this.server.listen.bind(this.server))
    await listen(this.port)
  }

  async stop(): Promise<void> {
    const close = promisify(this.server.close.bind(this.server))
    await close()
  }
}

class HttpStream extends Writable {
  private stream: Writable
  tempfile: string

  constructor(private readonly url: string) {
    super()
  }

  _write(
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void
  ): void {
    if (this.stream === undefined) {
      tmp.file((error, name, fd) => {
        if (error !== null) return callback(error)
        this.tempfile = name

        this.stream = fs.createWriteStream(name, { fd })
        this.stream.write(chunk, encoding, callback)
      })
    } else {
      this.stream.write(chunk, encoding, callback)
    }
  }

  _final(callback: (error?: Error | null) => void): void {
    this.stream.end((err?: Error | null) => {
      if (err !== undefined && err !== null) return callback(err)
      const url = new URL(this.url)
      const req = http.request(url, {
        method: 'PUT',
      })
      fs.createReadStream(this.tempfile)
        .pipe(req)
        .on('error', callback)
        .on('finish', callback)
    })
  }
}

type Callback = (err?: Error | null) => void

describe('HttpStream', () => {
  const port = 8998
  let reportServer: ReportServer

  beforeEach(async () => {
    reportServer = new ReportServer(port)
    await reportServer.start()
  })

  afterEach(async () => {
    await reportServer.stop()
  })

  it('sends a request with written data when the stream is closed', (callback: Callback) => {
    const stream = new HttpStream(`http://localhost:${port}/s3`)

    stream.on('error', callback).on('finish', callback)

    stream.write('hello')
    stream.write(' work')
    stream.end()

    assert.strictEqual(reportServer.bodies[0].toString('utf-8'), 'hello work')
  })
})
