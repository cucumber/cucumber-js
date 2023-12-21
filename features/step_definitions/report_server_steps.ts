import { URL } from 'node:url'
import assert from 'node:assert'
import { expect } from 'chai'
import { Given, Then, DataTable } from '../..'
import { World } from '../support/world'
import FakeReportServer from '../../test/fake_report_server'

Given(
  'a report server is running on {string}',
  async function (this: World, url: string) {
    const port = parseInt(new URL(url).port)
    this.reportServer = new FakeReportServer(port)
    await this.reportServer.start()
  }
)

Then(
  'the server should receive the following message types:',
  async function (this: World, expectedMessageTypesTable: DataTable) {
    const expectedMessageTypes = expectedMessageTypesTable
      .raw()
      .map((row) => row[0])

    const receivedBodies = await this.reportServer.stop()
    const ndjson = receivedBodies.toString('utf-8').trim()
    if (ndjson === '') assert.fail('Server received nothing')

    const receivedMessageTypes = ndjson
      .split(/\n/)
      .map((line) => JSON.parse(line))
      .map((envelope) => Object.keys(envelope)[0])

    expect(receivedMessageTypes).to.deep.eq(expectedMessageTypes)
  }
)

Then(
  'the server should receive a(n) {string} header with value {string}',
  function (this: World, name: string, value: string) {
    expect(this.reportServer.receivedHeaders[name.toLowerCase()]).to.eq(value)
  }
)
