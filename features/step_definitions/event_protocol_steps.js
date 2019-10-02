/* eslint-disable babel/new-cap */

import _ from 'lodash'
import { Then } from '../../'
import { expect } from 'chai'
import DataTable from '../../src/models/data_table'
import {
  getPickleStep,
  getPickleNamesInOrderOfExecution,
  getTestCaseResult,
  getTestStepAttachmentEvents,
  getTestStepAttachmentEventsForHook,
  getTestStepResults,
} from '../support/event_protocol_helpers'

Then('it runs {int} scenarios', function(expectedCount) {
  const testCaseStartedEvents = _.filter(this.lastRun.events, [
    'type',
    'test-case-started',
  ])
  expect(testCaseStartedEvents).to.have.lengthOf(expectedCount)
})

Then('it runs the scenario {string}', function(name) {
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.events)
  expect(actualNames).to.eql([name])
})

Then('it runs the scenarios {string} and {string}', function(name1, name2) {
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.events)
  expect(actualNames).to.eql([name1, name2])
})

Then('it runs the scenarios:', function(table) {
  const expectedNames = table.rows().map(row => row[0])
  const actualNames = getPickleNamesInOrderOfExecution(this.lastRun.events)
  expect(expectedNames).to.eql(actualNames)
})

Then('scenario {string} has status {string}', function(name, status) {
  const result = getTestCaseResult(this.lastRun.events, name)
  expect(result.status).to.eql(status)
})

Then('the scenario {string} has the steps:', function(name, table) {
  const actualTexts = getTestStepResults(this.lastRun.events, name).map(
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
  const testStepResults = getTestStepResults(this.lastRun.events, pickleName)
  const testStepResult = _.find(testStepResults, ['text', stepText])
  expect(testStepResult.result.status).to.eql(status)
})

Then('scenario {string} {string} hook has status {string}', function(
  pickleName,
  hookKeyword,
  status
) {
  const testStepResults = getTestStepResults(this.lastRun.events, pickleName)
  const testStepResult = _.find(testStepResults, ['text', hookKeyword])
  expect(testStepResult.result.status).to.eql(status)
})

Then('scenario {string} step {string} failed with:', function(
  pickleName,
  stepText,
  errorMessage
) {
  const testStepResults = getTestStepResults(this.lastRun.events, pickleName)
  const testStepResult = _.find(testStepResults, ['text', stepText])
  expect(testStepResult.result.status).to.eql('failed')
  expect(testStepResult.result.exception).to.include(errorMessage)
})

Then('scenario {string} step {string} has the doc string:', function(
  pickleName,
  stepText,
  docString
) {
  const pickleStep = getPickleStep(this.lastRun.events, pickleName, stepText)
  expect(pickleStep.argument.docString.content).to.eql(docString)
})

Then('scenario {string} step {string} has the data table:', function(
  pickleName,
  stepText,
  dataTable
) {
  const pickleStep = getPickleStep(this.lastRun.events, pickleName, stepText)
  expect(new DataTable(pickleStep.argument.dataTable)).to.eql(dataTable)
})

Then('scenario {string} step {string} has the attachments:', function(
  pickleName,
  stepText,
  table
) {
  const expectedAttachments = table.hashes().map(x => {
    return { data: x.DATA, mediaType: x['MEDIA TYPE'] }
  })
  const stepAttachmentEvents = getTestStepAttachmentEvents(
    this.lastRun.events,
    pickleName,
    stepText
  )
  const actualAttachments = stepAttachmentEvents.map(e => {
    return { data: e.data, mediaType: e.media.type }
  })
  expect(actualAttachments).to.eql(expectedAttachments)
})

Then('scenario {string} {string} hook has the attachments:', function(
  pickleName,
  hookKeyword,
  table
) {
  const expectedAttachments = table.hashes().map(x => {
    return { data: x.DATA, mediaType: x['MEDIA TYPE'] }
  })
  const stepAttachmentEvents = getTestStepAttachmentEventsForHook(
    this.lastRun.events,
    pickleName,
    hookKeyword === 'Before'
  )
  const actualAttachments = stepAttachmentEvents.map(e => {
    return { data: e.data, mediaType: e.media.type }
  })
  expect(actualAttachments).to.eql(expectedAttachments)
})
