import { Server, Socket } from 'net'
import { pipeline, Writable } from 'stream'
import assert from 'assert'
import express from 'express'
import fs from 'fs'
import http from 'http'
import { promisify } from 'util'
import tmp from 'tmp'

class ReportServer {
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
      res.status(202).end()
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
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH'

class HttpStream extends Writable {
  private tempFilePath: string
  private tempFile: Writable

  constructor(
    private readonly url: string,
    private readonly method: HttpMethod
  ) {
    super()
  }

  _write(
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void
  ): void {
    if (this.tempFile === undefined) {
      tmp.file((err, name, fd) => {
        if (err !== null && err !== undefined) return callback(err)

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
    method: HttpMethod,
    callback: (error?: Error | null) => void
  ): void {
    // TODO: Follow regular 3xx redirects

    if (method === 'GET') {
      http.get(url, (res) => {
        if (res.statusCode >= 400) {
          return callback(
            new Error(`${method} ${url} returned status ${res.statusCode}`)
          )
        }
        if (res.statusCode !== 202 || res.headers.location === undefined) {
          return callback()
        }
        this.sendRequest(res.headers.location, 'PUT', callback)
      })
    } else {
      const req = http.request(url, {
        method,
      })

      req.on('response', (res) => {
        if (res.statusCode >= 400) {
          return callback(
            new Error(`${method} ${url} returned status ${res.statusCode}`)
          )
        }
        callback()
      })

      pipeline(fs.createReadStream(this.tempFilePath), req, (err) => {
        if (err !== null && err !== undefined) callback(err)
      })
    }
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

  it(`sends a PUT request with written data when the stream is closed`, (callback: Callback) => {
    const stream = new HttpStream(`http://localhost:${port}/s3`, 'PUT')

    stream.on('error', callback)
    stream.on('finish', () => {
      reportServer
        .stop()
        .then((receivedBodies) => {
          try {
            assert.strictEqual(receivedBodies.toString('utf-8'), 'hello work')
            callback()
          } catch (err) {
            callback(err)
          }
        })
        .catch(callback)
    })

    stream.write('hello')
    stream.write(' work')
    stream.end()
  })

  it(`follows location from GET response, and sends body in a PUT request`, (callback: Callback) => {
    const stream = new HttpStream(`http://localhost:${port}/api/reports`, 'GET')

    stream.on('error', callback)
    stream.on('finish', () => {
      reportServer
        .stop()
        .then((receivedBodies) => {
          try {
            assert.strictEqual(receivedBodies.toString('utf-8'), 'hello work')
            callback()
          } catch (err) {
            callback(err)
          }
        })
        .catch(callback)
    })

    stream.write('hello')
    stream.write(' work')
    stream.end()
  })
})
