import assert from 'assert'
import HttpStream from './http_stream'
import FakeReportServer from './fake_report_server'

type Callback = (err?: Error | null) => void

describe('HttpStream', () => {
  const port = 8998
  let reportServer: FakeReportServer

  beforeEach(async () => {
    reportServer = new FakeReportServer(port)
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
