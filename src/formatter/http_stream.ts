import { pipeline, Transform, Writable } from 'stream'
import tmp from 'tmp'
import fs from 'fs'
import http from 'http'
import https from 'https'
import { doesHaveValue } from '../value_checker'

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

export type HttpResult = {
  httpOk: boolean
  responseBody: string
}

/**
 * This Writable writes data to a HTTP/HTTPS URL.
 *
 * It has special handling for https://reports.cucumber.io/
 * which uses an API where the first request is a `GET`,
 * and if the response is 202 with a Location header, issues
 * a PUT request to that URL.
 *
 * 3xx redirects are not currently followed.
 */
export default class HttpStream extends Transform {
  private tempFilePath: string
  private tempFile: Writable
  private responseBodyFromGet: string | null = null
  private httpOk: boolean

  constructor(
    private readonly url: string,
    private readonly method: HttpMethod,
    private readonly headers: { [name: string]: string }
  ) {
    super({
      readableObjectMode: true,
    })
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (err?: Error | null) => void
  ): void {
    if (this.tempFile === undefined) {
      tmp.file((err, name, fd) => {
        if (doesHaveValue(err)) return callback(err)

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
        (err: Error | null | undefined) => {
          if (doesHaveValue(err)) {
            this.emit('error', err)
          } else {
            this.push({
              httpOk: this.httpOk,
              responseBody: this.responseBodyFromGet,
            })
          }

          return callback(err)
        }
      )
    })
  }

  private sendRequest(
    url: string,
    method: HttpMethod,
    callback: (err: Error | null | undefined, url?: string) => void
  ): void {
    const httpx = doesHaveValue(url.match(/^https:/)) ? https : http

    if (method === 'GET') {
      httpx.get(url, { headers: this.headers }, (res) => {
        let body = Buffer.alloc(0)

        this.httpOk = res.statusCode === 202

        res.on('data', (chunk) => {
          body = Buffer.concat([body, chunk])
        })

        if (res.statusCode >= 400) {
          res.on('end', () => {
            this.responseBodyFromGet = body.toString('utf-8')
            return callback(null, url)
          })
        }

        if (res.statusCode !== 202 || res.headers.location === undefined) {
          callback(null, url)
        } else {
          res.on('end', () => {
            this.responseBodyFromGet = body.toString('utf-8')
            this.sendRequest(res.headers.location, 'PUT', callback)
          })
        }
      })
      // TODO: call callback with error if httpx request fails
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
            callback(null, url)
          })
          res.on('error', callback)
        } else {
          callback(null, url)
        }
      })

      pipeline(fs.createReadStream(this.tempFilePath), req, (err) => {
        if (doesHaveValue(err)) callback(err)
      })
    }
  }
}
