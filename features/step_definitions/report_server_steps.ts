import assert from 'node:assert'
import { gunzipSync } from 'node:zlib'
import { expect } from 'chai'
import { After, Before, type DataTable, Given, Then } from '../..'
import FakeProxyServer from '../../test/fake_proxy_server'
import FakeReportServer from '../../test/fake_report_server'
import type { World } from '../support/world'

Before('@reports', async function (this: World) {
  this.reportServer = new FakeReportServer(9987)
  await this.reportServer.start()
  this.proxyServer = new FakeProxyServer(9988)
  await this.proxyServer.start()
})

After('@reports', async function (this: World) {
  if (this.reportServer.started) {
    await this.reportServer.stop()
  }
  if (this.proxyServer.started) {
    await this.proxyServer.stop()
  }
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
