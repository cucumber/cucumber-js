import { pipeline, Writable } from 'stream'
import tmp from 'tmp'
import fs from 'fs'
import http from 'http'
import https from 'https'

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

/**
 * This Writable writes data to a HTTP/HTTPS URL.
 *
 * It has special handling for https://reports.cucumber.io/
 * which uses an API where the first request is a `GET`,
 * and if the response is 202 with a Location header, issues
 * a PUT request to that URL.
 */
export default class HttpStream extends Writable {
  private tempFilePath: string
  private tempFile: Writable
  private responseBodyFromGet: string | null = null

  constructor(
    private readonly url: string,
    private readonly method: HttpMethod,
    private readonly headers: { [name: string]: string },
    private readonly reportLocation: (content: string) => void
  ) {
    super()
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (err?: Error | null) => void
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
      this.sendRequest(
        this.url,
        this.method,
        (err: Error | null | undefined, url: string) => {
          if (err !== null && err !== undefined) return callback(err)
          this.reportLocation(this.responseBodyFromGet)
          callback(null)
        }
      )
    })
  }

  private sendRequest(
    url: string,
    method: HttpMethod,
    callback: (err: Error | null | undefined, url?: string) => void
  ): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const httpx = url.match(/^https:/) ? https : http

    // TODO: Follow regular 3xx redirects

    if (method === 'GET') {
      httpx.get(url, { headers: this.headers }, (res) => {
        if (res.statusCode >= 400) {
          return callback(
            new Error(`${method} ${url} returned status ${res.statusCode}`)
          )
        }

        if (res.statusCode !== 202 || res.headers.location === undefined) {
          callback(null, url)
        } else {
          let body = Buffer.alloc(0)
          res.on('data', (chunk) => {
            body = Buffer.concat([body, chunk])
          })
          res.on('end', () => {
            this.responseBodyFromGet = body.toString('utf-8')
            this.sendRequest(res.headers.location, 'PUT', callback)
          })
        }
      })
    } else {
      const contentLength = fs.statSync(this.tempFilePath).size
      const req = httpx.request(url, {
        method,
        headers: {
          'Content-Length': contentLength,
        },
      })

      req.on('response', (res) => {
        if (res.statusCode >= 400) {
          let body = Buffer.alloc(0)
          res.on('data', (chunk) => {
            body = Buffer.concat([body, chunk])
          })
          res.on('end', () => {
            callback(
              new Error(
                `${method} ${url} returned status ${
                  res.statusCode
                }:\n${body.toString('utf-8')}`
              )
            )
          })
          res.on('error', callback)
        } else {
          callback(null, url)
        }
      })

      pipeline(fs.createReadStream(this.tempFilePath), req, (err) => {
        if (err !== null && err !== undefined) callback(err)
      })
    }
  }
}
