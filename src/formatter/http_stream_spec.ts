import assert from 'assert'
import HttpStream, { HttpResult } from './http_stream'
import FakeReportServer from '../../test/fake_report_server'
import { Writable } from 'stream'

type Callback = (err?: Error | null) => void

describe('HttpStream', () => {
  const port = 8998
  let reportServer: FakeReportServer

  beforeEach(async () => {
    reportServer = new FakeReportServer(port)
    await reportServer.start()
  })

  it(`sends a PUT request with written data when the stream is closed`, (callback: Callback) => {
    const stream = new HttpStream(`http://localhost:${port}/s3`, 'PUT', {})

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

  it(`follows location from GET response, and sends body and headers in a PUT request`, (callback: Callback) => {
    const bearerToken = 'f318d9ec-5a3d-4727-adec-bd7b69e2edd3'

    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      { Authorization: `Bearer ${bearerToken}` }
    )

    stream.on('error', callback)
    stream.on('finish', () => {
      reportServer
        .stop()
        .then((receivedBodies) => {
          try {
            const expectedBody = 'hello work'
            assert.strictEqual(receivedBodies.toString('utf-8'), expectedBody)
            assert.strictEqual(
              reportServer.receivedHeaders['content-length'],
              expectedBody.length.toString()
            )
            assert.strictEqual(
              reportServer.receivedHeaders.authorization,
              `Bearer ${bearerToken}`
            )
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

  it('outputs the body provided by the server', (callback: Callback) => {
    let reported: HttpResult

    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      {} //,
      // (err, content) => {
      //   if (err) return callback(err)
      //   reported = content
      // }
    )

    stream.pipe(
      new Writable({
        write: function (httpResult: HttpResult, encoding, writeCallback) {
          reported = httpResult
          writeCallback()
        },
      })
    )

    stream.on('error', callback)
    stream.on('finish', () => {
      reportServer
        .stop()
        .then(() => {
          try {
            assert.strictEqual(
              reported,
              `┌──────────────────────────────────────────────────────────────────────────┐
│ View your Cucumber Report at:                                            │
│ https://reports.cucumber.io/reports/f318d9ec-5a3d-4727-adec-bd7b69e2edd3 │
│                                                                          │
│ This report will self-destruct in 24h unless it is claimed or deleted.   │
└──────────────────────────────────────────────────────────────────────────┘
`
            )
            callback()
          } catch (err) {
            callback(err)
          }
        })
        .catch(callback)
    })

    stream.write('hello')
    stream.end()
  })

  it('reports the body provided by the server even when an error is returned by the server and still fail', (callback: Callback) => {
    let reported: string
    let errorThrown: Error | undefined

    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      { Authorization: `Bearer an-invalid-token` }
      // (err, content) => {
      //   reported = content
      //   errorThrown = err
      // }
    )

    stream.on('error', () => {})
    stream.on('finish', () => {
      reportServer
        .stop()
        .then(() => {
          assert.strictEqual(
            reported,
            `┌─────────────────────┐
│ Error invalid token │
└─────────────────────┘
`
          )
          assert.notStrictEqual(errorThrown, undefined)
          callback()
        })
        .catch((err) => {
          callback(err)
        })
    })

    stream.write('hello')
    stream.end()
  })
})
