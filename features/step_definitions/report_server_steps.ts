import { Given, Then, DataTable } from '../..'
import { expect } from 'chai'

Given('a report server is running on {string}', function (url: string) {
  // TODO
})

Then('the server should receive the following message types:', function (
  expectedMessageTypesTable: DataTable
) {
  const expectedMessageTypes = expectedMessageTypesTable
    .rows()
    .map((row) => row[0])
  const receivedMessageTypes = ['meta', 'testRunStarted', 'testRunFinished']
  expect(receivedMessageTypes).to.deep.eq(expectedMessageTypes)
})
