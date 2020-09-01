import { Server } from 'net'
import { Writable } from 'stream'
import assert from 'assert'
import express from 'express'
import fs from 'fs'
import http from 'http'
import { promisify } from 'util'
import tmp from 'tmp'

class ReportServer {
  private readonly server: Server

  constructor(
    private readonly port: number,
    private readonly stream: Writable
  ) {
    const app = express()

    app.put('/s3', (req, res) => {
      req.pipe(this.stream).on('finish', () => res.end())
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
      const req = http.request(this.url, {
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
  let receivedBodies: Buffer
  let receivedBodiesStream: Writable

  beforeEach(async () => {
    receivedBodies = Buffer.alloc(0)
    receivedBodiesStream = new Writable({
      write(chunk: Buffer, encoding: string, callback: Callback) {
        receivedBodies = Buffer.concat([receivedBodies, chunk])
        callback()
      },
    })
    reportServer = new ReportServer(port, receivedBodiesStream)
    await reportServer.start()
  })

  afterEach(async () => {
    await reportServer.stop()
  })

  it('sends a request with written data when the stream is closed', (callback: Callback) => {
    receivedBodiesStream.on('finish', () => {
      try {
        assert.strictEqual(receivedBodies.toString('utf-8'), 'hello work')
        callback()
      } catch (error) {
        callback(error)
      }
    })

    const stream = new HttpStream(`http://localhost:${port}/s3`)

    stream.on('error', callback)

    stream.write('hello')
    stream.write(' work')
    stream.end()
  })
})
