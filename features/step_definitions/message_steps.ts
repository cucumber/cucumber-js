import _ from 'lodash'
import { Then } from '../../'
import { expect } from 'chai'
import DataTable from '../../src/models/data_table'
import {
  getPickleNamesInOrderOfExecution,
  getPickleStep,
  getTestCaseResult,
  getTestStepAttachmentsForHook,
  getTestStepAttachmentsForStep,
  getTestStepResults,
} from '../support/message_helpers'
import { messages } from 'cucumber-messages'
import { World } from '../support/world'

type StringifiedStatus =
  | 'UNKNOWN'
  | 'PASSED'
  | 'SKIPPED'
  | 'PENDING'
  | 'UNDEFINED'
  | 'AMBIGUOUS'
  | 'FAILED'

const { Status } = messages.TestResult

Then('it runs {int} scenarios', function(this: World, expectedCount: number) {
  const testCaseStartedEvents = _.filter(
    this.lastRun.envelopes,
    e => e.testCaseStarted
  )
  expect(testCaseStartedEvents).to.have.lengthOf(expectedCount)
})

Then('it runs the scenario {string}', function(this: World, name: string) {
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.envelopes)
  expect(actualNames).to.eql([name])
})

Then('it runs the scenarios {string} and {string}', function(
  this: World,
  name1: string,
  name2: string
) {
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.envelopes)
  expect(actualNames).to.eql([name1, name2])
})

Then('it runs the scenarios:', function(this: World, table: DataTable) {
  const expectedNames = table.rows().map(row => row[0])
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.envelopes)
  expect(expectedNames).to.eql(actualNames)
})

Then('scenario {string} has status {string}', function(
  this: World,
  name: string,
  status: string
) {
  const result = getTestCaseResult(this.lastRun.envelopes, name)
  expect(result.status).to.eql(
    Status[status.toUpperCase() as StringifiedStatus]
  )
})

Then('the scenario {string} has the steps:', function(
  this: World,
  name: string,
  table: DataTable
) {
  const actualTexts = getTestStepResults(this.lastRun.envelopes, name).map(
    s => s.text
  )
  const expectedTexts = table.rows().map(row => row[0])
  expect(actualTexts).to.eql(expectedTexts)
})

Then('scenario {string} step {string} has status {string}', function(
  this: World,
  pickleName: string,
  stepText: string,
  status: string
) {
  const testStepResults = getTestStepResults(this.lastRun.envelopes, pickleName)
  const testStepResult = _.find(testStepResults, ['text', stepText])
  expect(testStepResult.result.status).to.eql(
    Status[status.toUpperCase() as StringifiedStatus]
  )
})

Then(
  'scenario {string} attempt {int} step {string} has status {string}',
  function(
    this: World,
    pickleName: string,
    attempt: number,
    stepText: string,
    status: string
  ) {
    const testStepResults = getTestStepResults(
      this.lastRun.envelopes,
      pickleName,
      attempt
    )
    const testStepResult = _.find(testStepResults, ['text', stepText])
    expect(testStepResult.result.status).to.eql(
      Status[status.toUpperCase() as StringifiedStatus]
    )
  }
)

Then('scenario {string} {string} hook has status {string}', function(
  this: World,
  pickleName: string,
  hookKeyword: string,
  status: string
) {
  const testStepResults = getTestStepResults(this.lastRun.envelopes, pickleName)
  const testStepResult = _.find(testStepResults, ['text', hookKeyword])
  expect(testStepResult.result.status).to.eql(
    Status[status.toUpperCase() as StringifiedStatus]
  )
})

Then('scenario {string} step {string} failed with:', function(
  this: World,
  pickleName: string,
  stepText: string,
  errorMessage: string
) {
  const testStepResults = getTestStepResults(this.lastRun.envelopes, pickleName)
  const testStepResult = _.find(testStepResults, ['text', stepText])
  expect(testStepResult.result.status).to.eql(Status.FAILED)
  expect(testStepResult.result.message).to.include(errorMessage)
})

Then('scenario {string} attempt {int} step {string} failed with:', function(
  this: World,
  pickleName: string,
  attempt: number,
  stepText: string,
  errorMessage: string
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
  this: World,
  pickleName: string,
  stepText: string,
  docString: string
) {
  const pickleStep = getPickleStep(this.lastRun.envelopes, pickleName, stepText)
  expect(pickleStep.argument.docString.content).to.eql(docString)
})

Then('scenario {string} step {string} has the data table:', function(
  this: World,
  pickleName: string,
  stepText: string,
  dataTable: DataTable
) {
  const pickleStep = getPickleStep(this.lastRun.envelopes, pickleName, stepText)
  expect(new DataTable(pickleStep.argument.dataTable)).to.eql(dataTable)
})

Then('scenario {string} step {string} has the attachments:', function(
  this: World,
  pickleName: string,
  stepText: string,
  table: DataTable
) {
  const expectedAttachments = table.hashes().map(x => {
    return {
      data: x.DATA,
      media: messages.Media.fromObject({
        contentType: x['MEDIA TYPE'],
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
  this: World,
  pickleName: string,
  hookKeyword: string,
  table: DataTable
) {
  const expectedAttachments = table.hashes().map(x => {
    return {
      data: x.DATA,
      media: messages.Media.fromObject({
        contentType: x['MEDIA TYPE'],
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
