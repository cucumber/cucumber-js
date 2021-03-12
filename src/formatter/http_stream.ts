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

export interface HttpResult {
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
  private redirectResult: HttpResult

  public currentStatus:
    | 'created'
    | 'start 1st request'
    | 'finished 1st request'
    | 'started 2nd request'
    | 'finished 2nd request'
    | 'Finalized'

  constructor(
    private readonly url: string,
    private readonly method: HttpMethod,
    private readonly headers: { [name: string]: string }
  ) {
    super({
      readableObjectMode: true,
    })
    this.currentStatus = 'created'
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
        (err: Error | null | undefined, httpResult) => {
          this.currentStatus = 'Finalized'

          if (doesHaveValue(err)) {
            this.emit('error', err)
          } else {
            this.push(httpResult)
          }

          return callback(err)
        }
      )
    })
  }

  private sendRequest(
    url: string,
    method: HttpMethod,
    callback: (err: Error | null | undefined, httpResult?: HttpResult) => void
  ): void {
    const httpx = doesHaveValue(url.match(/^https:/)) ? https : http

    if (method === 'GET') {
      this.sendRedirectRequest(url, method, callback, httpx)
    } else {
      this.sendUploadRequest(url, method, callback, httpx)
    }
  }

  private sendRedirectRequest(
    url: string,
    method: HttpMethod,
    callback: (err: Error | null | undefined, httpResult?: HttpResult) => void,
    httpx: typeof http | typeof https
  ): void {
    this.currentStatus = 'start 1st request'
    httpx.get(url, { headers: this.headers }, (res) => {
      let body = Buffer.alloc(0)
      res.on('data', (chunk) => {
        body = Buffer.concat([body, chunk])
      })

      res.on('end', () => {
        this.currentStatus = 'finished 1st request'

        const httpOk =
          res.statusCode === 202 && res.headers.location !== undefined
        const httpResult: HttpResult = {
          responseBody: body.toString('utf-8'),
          httpOk,
        }

        if (httpOk) {
          this.redirectResult = httpResult
          this.sendUploadRequest(res.headers.location, 'PUT', callback, httpx)
        } else {
          callback(null, httpResult)
        }
      })

      res.on('error', callback)
    })
  }

  private sendUploadRequest(
    url: string,
    method: HttpMethod,
    callback: (err: Error | null | undefined, httpResult?: HttpResult) => void,
    httpx: typeof http | typeof https
  ): void {
    this.currentStatus = 'started 2nd request'
    const contentLength = fs.statSync(this.tempFilePath).size
    const req = httpx.request(url, {
      method,
      headers: {
        'Content-Length': contentLength,
      },
    })

    req.on('response', (res) => {
      let body = Buffer.alloc(0)
      res.on('data', (chunk) => {
        body = Buffer.concat([body, chunk])
      })
      res.on('end', () => {
        this.currentStatus = 'finished 2nd request'
        const httpOk = res.statusCode < 300
        const httpResult: HttpResult = {
          responseBody: this.redirectResult
            ? this.redirectResult.responseBody
            : body.toString('utf-8'),
          httpOk,
        }
        callback(null, httpResult)
      })
      res.on('error', callback)
    })

    pipeline(fs.createReadStream(this.tempFilePath), req, (err) => {
      if (doesHaveValue(err)) callback(err)
    })
  }
}
