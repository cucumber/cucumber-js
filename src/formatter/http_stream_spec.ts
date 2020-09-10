import assert from 'assert'
import HttpStream from './http_stream'
import FakeReportServer from '../../test/fake_report_server'

type Callback = (err?: Error | null) => void

describe('HttpStream', () => {
  const port = 8998
  let reportServer: FakeReportServer

  beforeEach(async () => {
    reportServer = new FakeReportServer(port)
    await reportServer.start()
  })

  it(`sends a PUT request with written data when the stream is closed`, (callback: Callback) => {
    const stream = new HttpStream(
      `http://localhost:${port}/s3`,
      'PUT',
      {},
      () => undefined
    )

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
    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      { Authorization: 'Bearer blablabla' },
      () => undefined
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
              'Bearer blablabla'
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
    let reported: string

    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      {},
      (content) => {
        reported = content
      }
    )

    stream.on('error', callback)
    stream.on('finish', () => {
      reportServer
        .stop()
        .then((receivedBodies) => {
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
})
