import * as http from 'http'

import { Server } from 'net'
import { Writable } from 'stream'
import express from 'express'
import fs from 'fs'
import { promisify } from 'util'
import tmp from 'tmp'

class ReportServer {
  private readonly server: Server
  constructor(private readonly port: number) {
    const app = express()
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

  constructor(url: string) {
    super()
  }

  _write(
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void
  ): void {
    if (this.stream === undefined) {
      tmp.file((error, name, fd) => {
        if (error !== undefined) return callback(error)

        this.stream = fs.createWriteStream(name, { fd })
        this.stream.write(chunk, encoding, callback)
      })
    } else {
      this.stream.write(chunk, encoding, callback)
    }
  }
}

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

  it('sends a request with written data when the stream is closed', async () => {
    const stream = new HttpStream(`http://localhost:${port}/s3`)
    stream.write('hello')
    stream.end()
  })
})
