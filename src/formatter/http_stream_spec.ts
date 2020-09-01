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

    app.get('/api/reports', (req, res) => {
      res.setHeader('Location', `http://localhost:${port}/s3`)
      res.status(202).end()
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
  private tempFilePath: string
  private tempFile: Writable

  constructor(private readonly url: string, private readonly method: string) {
    super()
  }

  _write(
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void
  ): void {
    if (this.tempFile === undefined) {
      tmp.file((error, name, fd) => {
        if (error !== null) return callback(error)

        this.tempFilePath = name
        this.tempFile = fs.createWriteStream(name, { fd })
        this.tempFile.write(chunk, encoding, callback)
      })
    } else {
      this.tempFile.write(chunk, encoding, callback)
    }
  }

  _final(callback: (error?: Error | null) => void): void {
    this.tempFile.end(() => {
      this.sendRequest(this.url, this.method, callback)
    })
  }

  private sendRequest(
    url: string,
    method: string,
    callback: (error?: Error | null) => void
  ): void {
    const req = http.request(url, {
      method: method,
    })
    if (method !== 'GET') {
      fs.createReadStream(this.tempFilePath)
        .pipe(req)
        .on('error', callback)
        .on('finish', callback)
    } else {
      // TODO: Check if status is 202 and if we actually have a location
      req.on('response', (res) => {
        this.sendRequest(res.headers.location, 'PUT', callback)
      })
      req.end()
    }
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

  it('sends a PUT request with written data when the stream is closed', (callback: Callback) => {
    receivedBodiesStream.on('finish', () => {
      try {
        assert.strictEqual(receivedBodies.toString('utf-8'), 'hello work')
        callback()
      } catch (error) {
        callback(error)
      }
    })

    const stream = new HttpStream(`http://localhost:${port}/s3`, 'PUT')

    stream.on('error', callback)

    stream.write('hello')
    stream.write(' work')
    stream.end()
  })

  it('follows location from GET response, and sends body in a PUT request', (callback: Callback) => {
    receivedBodiesStream.on('finish', () => {
      try {
        assert.strictEqual(receivedBodies.toString('utf-8'), 'hello work')
        callback()
      } catch (error) {
        callback(error)
      }
    })

    const stream = new HttpStream(`http://localhost:${port}/api/reports`, 'GET')

    stream.on('error', callback)

    stream.write('hello')
    stream.write(' work')
    stream.end()
  })
})
