import assert from 'assert'
import { expect } from 'chai'
import sinon from 'sinon'
import HttpStream from './http_stream'
import FakeReportServer, {
  FAKE_IDENTIFIER,
} from '../../test/fake_report_server'
import { Writable } from 'stream'

type Callback = (err?: Error | null) => void

describe('HttpStream', () => {
  let reportServer: FakeReportServer
  let port: number

  beforeEach(async () => {
    reportServer = new FakeReportServer(0)
    port = await reportServer.start()
  })

  it(`sends a PUT request with written data when the stream is closed`, (callback: Callback) => {
    const stream = new HttpStream(
      `http://localhost:${port}/s3/${FAKE_IDENTIFIER}`,
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
    const bearerToken = 'f318d9ec-5a3d-4727-adec-bd7b69e2edd3'

    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      { Authorization: `Bearer ${bearerToken}` },
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
    let reported: string

    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      {},
      () => undefined
    )

    const readerStream = new Writable({
      objectMode: true,
      write: function (responseBody: string, encoding, writeCallback) {
        reported = responseBody
        writeCallback()
      },
    })

    stream.pipe(readerStream)

    stream.on('error', callback)
    readerStream.on('error', callback)

    readerStream.on('finish', () => {
      reportServer
        .stop()
        .then(() => {
          try {
            const expectedResult = `┌──────────────────────────────────────────────────────────────────────────┐
│ View your Cucumber Report at:                                            │
│ https://reports.cucumber.io/reports/f318d9ec-5a3d-4727-adec-bd7b69e2edd3 │
│                                                                          │
│ This report will self-destruct in 24h unless it is claimed or deleted.   │
└──────────────────────────────────────────────────────────────────────────┘
`
            assert.deepStrictEqual(reported, expectedResult)
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

  it('calls the handler with the url', (callback: Callback) => {
    const handler = sinon.spy()
    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      {},
      handler
    )

    const readerStream = new Writable({
      objectMode: true,
      write: function (responseBody: string, encoding, writeCallback) {
        writeCallback()
      },
    })

    stream.pipe(readerStream)

    stream.on('error', callback)
    readerStream.on('error', callback)

    readerStream.on('finish', () => {
      reportServer
        .stop()
        .then(() => {
          try {
            expect(handler).to.have.been.calledOnceWith({
              url: `https://reports.cucumber.io/reports/f318d9ec-5a3d-4727-adec-bd7b69e2edd3`,
            })
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

  it('reports the body provided by the server but doesnt call handler when an error is returned by the server and still fail', (callback: Callback) => {
    let reported: string
    const handler = sinon.spy()
    const stream = new HttpStream(
      `http://localhost:${port}/api/reports`,
      'GET',
      { Authorization: `Bearer an-invalid-token` },
      handler
    )

    const readerStream = new Writable({
      objectMode: true,
      write: function (responseBody: string, encoding, writeCallback) {
        reported = responseBody
        writeCallback()
      },
    })

    stream.pipe(readerStream)

    stream.on('error', () => {
      reportServer
        .stop()
        .then(() => {
          const expectedResult = `┌─────────────────────┐
│ Error invalid token │
└─────────────────────┘
`
          assert.deepStrictEqual(reported, expectedResult)
          expect(handler).not.to.have.been.called()
          callback()
        })
        .catch(callback)
    })
    readerStream.on('error', callback)

    stream.write('hello')
    stream.end()
  })
})
