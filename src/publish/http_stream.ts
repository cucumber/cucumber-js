import { pipeline, Transform, Writable } from 'node:stream'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import tmp from 'tmp'
import { doesHaveValue } from '../value_checker'

type HttpMethod = 'GET' | 'POST' | 'PUT'

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

  constructor(
    private readonly url: string,
    private readonly method: HttpMethod,
    private readonly headers: http.OutgoingHttpHeaders
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
      this.sendHttpRequest(
        this.url,
        this.method,
        this.headers,
        (err1, res1) => {
          if (doesHaveValue(err1)) return callback(err1)
          this.pushResponseBody(res1, () => {
            this.emitErrorUnlessHttp2xx(res1, this.url, this.method)
            if (
              res1.statusCode === 202 &&
              res1.headers.location !== undefined
            ) {
              this.sendHttpRequest(
                res1.headers.location,
                'PUT',
                {},
                (err2, res2) => {
                  if (doesHaveValue(err2)) return callback(err2)
                  this.emitErrorUnlessHttp2xx(res2, this.url, this.method)
                  callback()
                }
              )
            } else {
              callback()
            }
          })
        }
      )
    })
  }

  private pushResponseBody(res: http.IncomingMessage, done: () => void): void {
    let body = Buffer.alloc(0)
    res.on('data', (chunk) => {
      body = Buffer.concat([body, chunk])
    })
    res.on('end', () => {
      this.push(body.toString('utf-8'))
      done()
    })
  }

  private emitErrorUnlessHttp2xx(
    res: http.IncomingMessage,
    url: string,
    method: string
  ): void {
    if (res.statusCode >= 300)
      this.emit(
        'error',
        new Error(
          `Unexpected http status ${res.statusCode} from ${method} ${url}`
        )
      )
  }

  private sendHttpRequest(
    url: string,
    method: HttpMethod,
    headers: http.OutgoingHttpHeaders,
    callback: (err?: Error | null, res?: http.IncomingMessage) => void
  ): void {
    const httpx = doesHaveValue(url.match(/^https:/)) ? https : http
    const additionalHttpHeaders: http.OutgoingHttpHeaders = {}

    const upload = method === 'PUT' || method === 'POST'
    if (upload) {
      additionalHttpHeaders['Content-Length'] = fs.statSync(
        this.tempFilePath
      ).size
    }

    const allHeaders = { ...headers, ...additionalHttpHeaders }
    const req = httpx.request(url, {
      method,
      headers: allHeaders,
    })
    req.on('error', (err) => this.emit('error', err))
    req.on('response', (res) => {
      res.on('error', (err) => this.emit('error', err))
      callback(null, res)
    })

    if (upload) {
      pipeline(fs.createReadStream(this.tempFilePath), req, (err) => {
        if (doesHaveValue(err)) {
          this.emit('error', err)
        }
      })
    } else {
      req.end()
    }
  }
}
