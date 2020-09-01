import { Given, Then, DataTable } from '../..'
import { World } from '../support/world'
import { expect } from 'chai'
import ReportServer from '../support/report_server'

Given('a report server is running on {string}', function (
  this: World,
  url: string
) {
  this.reportServer = new ReportServer()
})

Then('the server should receive the following message types:', function (
  this: World,
  expectedMessageTypesTable: DataTable
) {
  const expectedMessageTypes = expectedMessageTypesTable
    .rows()
    .map((row) => row[0])
  const receivedMessageTypes = this.reportServer.getReceivedMessageTypes()
  expect(receivedMessageTypes).to.deep.eq(expectedMessageTypes)
})
