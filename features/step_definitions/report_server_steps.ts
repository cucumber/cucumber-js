import assert from 'node:assert'
import { URL } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { expect } from 'chai'
import { type DataTable, Given, Then } from '../..'
import FakeProxyServer from '../../test/fake_proxy_server'
import FakeReportServer from '../../test/fake_report_server'
import type { World } from '../support/world'

Given('a report server is running on {string}', async function (this: World, url: string) {
  const port = parseInt(new URL(url).port, 10)
  this.reportServer = new FakeReportServer(port)
  await this.reportServer.start()
})

Given('a proxy server is running on {string}', async function (this: World, url: string) {
  const port = parseInt(new URL(url).port, 10)
  this.proxyServer = new FakeProxyServer(port)
  await this.proxyServer.start()
})

Given('report publishing is not working', async function (this: World) {
  this.reportServer.failOnTouch = true
})

Given('report uploads are not working', async function (this: World) {
  this.reportServer.failOnUpload = true
})

Then(
  'the server should receive the following message types:',
  async function (this: World, expectedMessageTypesTable: DataTable) {
    const expectedMessageTypes = expectedMessageTypesTable.raw().map((row) => row[0])

    const receivedBodies = await this.reportServer.stop()
    const ndjson = gunzipSync(receivedBodies).toString('utf-8').trim()
    if (ndjson === '') {
      assert.fail('Server received nothing')
    }

    const receivedMessageTypes = ndjson
      .split(/\n/)
      .map((line) => JSON.parse(line))
      .map((envelope) => Object.keys(envelope)[0])

    expect(receivedMessageTypes).to.deep.eq(expectedMessageTypes)
  }
)

Then('the proxy server should have proxied to {string}', function (this: World, target: string) {
  expect(this.proxyServer.proxiedTargets).to.include(target)
})

Then(
  'the server should receive a(n) {string} header with value {string}',
  function (this: World, name: string, value: string) {
    expect(this.reportServer.receivedHeaders[name.toLowerCase()]).to.eq(value)
  }
)
