/* eslint-disable babel/new-cap */

import _ from 'lodash'
import { Then } from '../../lib'
import { expect } from 'chai'
import DataTable from '../../src/models/data_table'
import {
  getPickleStep,
  getPickleNamesInOrderOfExecution,
  getTestCaseResult,
  getTestStepAttachmentsForStep,
  getTestStepAttachmentsForHook,
  getTestStepResults,
} from '../support/protobuf_helpers'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult

Then('it runs {int} scenarios', function(expectedCount) {
  const testCaseStartedEvents = _.filter(
    this.lastRun.envelopes,
    e => e.testCaseStarted
  )
  expect(testCaseStartedEvents).to.have.lengthOf(expectedCount)
})

Then('it runs the scenario {string}', function(name) {
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.envelopes)
  expect(actualNames).to.eql([name])
})

Then('it runs the scenarios {string} and {string}', function(name1, name2) {
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.envelopes)
  expect(actualNames).to.eql([name1, name2])
})

Then('it runs the scenarios:', function(table) {
  const expectedNames = table.rows().map(row => row[0])
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.envelopes)
  expect(expectedNames).to.eql(actualNames)
})

Then('scenario {string} has status {string}', function(name, status) {
  const result = getTestCaseResult(this.lastRun.envelopes, name)
  expect(result.status).to.eql(Status[status.toUpperCase()])
})

Then('the scenario {string} has the steps:', function(name, table) {
  const actualTexts = getTestStepResults(this.lastRun.envelopes, name).map(
    s => s.text
  )
  const expectedTexts = table.rows().map(row => row[0])
  expect(actualTexts).to.eql(expectedTexts)
})

Then('scenario {string} step {string} has status {string}', function(
  pickleName,
  stepText,
  status
) {
  const testStepResults = getTestStepResults(this.lastRun.envelopes, pickleName)
  const testStepResult = _.find(testStepResults, ['text', stepText])
  expect(testStepResult.result.status).to.eql(Status[status.toUpperCase()])
})

Then(
  'scenario {string} attempt {int} step {string} has status {string}',
  function(pickleName, attempt, stepText, status) {
    const testStepResults = getTestStepResults(
      this.lastRun.envelopes,
      pickleName,
      attempt
    )
    const testStepResult = _.find(testStepResults, ['text', stepText])
    expect(testStepResult.result.status).to.eql(Status[status.toUpperCase()])
  }
)

Then('scenario {string} {string} hook has status {string}', function(
  pickleName,
  hookKeyword,
  status
) {
  const testStepResults = getTestStepResults(this.lastRun.envelopes, pickleName)
  const testStepResult = _.find(testStepResults, ['text', hookKeyword])
  expect(testStepResult.result.status).to.eql(Status[status.toUpperCase()])
})

Then('scenario {string} step {string} failed with:', function(
  pickleName,
  stepText,
  errorMessage
) {
  const testStepResults = getTestStepResults(this.lastRun.envelopes, pickleName)
  const testStepResult = _.find(testStepResults, ['text', stepText])
  expect(testStepResult.result.status).to.eql(Status.FAILED)
  expect(testStepResult.result.message).to.include(errorMessage)
})

Then('scenario {string} attempt {int} step {string} failed with:', function(
  pickleName,
  attempt,
  stepText,
  errorMessage
) {
  const testStepResults = getTestStepResults(
    this.lastRun.envelopes,
    pickleName,
    attempt
  )
  const testStepResult = _.find(testStepResults, ['text', stepText])
  expect(testStepResult.result.status).to.eql(Status.FAILED)
  expect(testStepResult.result.message).to.include(errorMessage)
})

Then('scenario {string} step {string} has the doc string:', function(
  pickleName,
  stepText,
  docString
) {
  const pickleStep = getPickleStep(this.lastRun.envelopes, pickleName, stepText)
  expect(pickleStep.argument.docString.content).to.eql(docString)
})

Then('scenario {string} step {string} has the data table:', function(
  pickleName,
  stepText,
  dataTable
) {
  const pickleStep = getPickleStep(this.lastRun.envelopes, pickleName, stepText)
  expect(new DataTable(pickleStep.argument.dataTable)).to.eql(dataTable)
})

Then('scenario {string} step {string} has the attachments:', function(
  pickleName,
  stepText,
  table
) {
  const expectedAttachments = table.hashes().map(x => {
    return {
      data: x.DATA,
      media: messages.Media.fromObject({
        contentType: x['MEDIA CONTENT TYPE'],
        encoding: messages.Media.Encoding[x['MEDIA ENCODING']],
      }),
    }
  })
  const stepAttachments = getTestStepAttachmentsForStep(
    this.lastRun.envelopes,
    pickleName,
    stepText
  )
  const actualAttachments = stepAttachments.map(e => {
    return { data: e.data, media: e.media }
  })
  expect(actualAttachments).to.eql(expectedAttachments)
})

Then('scenario {string} {string} hook has the attachments:', function(
  pickleName,
  hookKeyword,
  table
) {
  const expectedAttachments = table.hashes().map(x => {
    return {
      data: x.DATA,
      media: messages.Media.fromObject({
        contentType: x['MEDIA CONTENT TYPE'],
        encoding: messages.Media.Encoding[x['MEDIA ENCODING']],
      }),
    }
  })
  const hookAttachments = getTestStepAttachmentsForHook(
    this.lastRun.envelopes,
    pickleName,
    hookKeyword === 'Before'
  )
  const actualAttachments = hookAttachments.map(e => {
    return { data: e.data, media: e.media }
  })
  expect(actualAttachments).to.eql(expectedAttachments)
})
