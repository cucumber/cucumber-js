import { pipeline, Writable } from 'stream'
import tmp from 'tmp'
import fs from 'fs'
import http from 'http'

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
