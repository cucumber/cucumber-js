import _ from 'lodash'
import sinon from 'sinon'
import Gherkin from 'gherkin'
import Status from '../status'

export function createMock(input) {
  if (_.isArray(input)) {
    input = _.zipObject(input)
  }
  return _.mapValues(input, value => sinon.stub().returns(value))
}

export function parseGherkinDocument(options) {
  const { eventBroadcaster, data, uri, language } = options
  const events = Gherkin.generateEvents(data, uri, null, language)
  events.forEach(event => {
    eventBroadcaster.emit(event.type, event)
    if (event.type === 'pickle') {
      eventBroadcaster.emit('pickle-accepted', {
        type: 'pickle-accepted',
        pickle: event.pickle,
        uri: event.uri,
      })
    }
  })
}

/**
 * Emulates events for test cases.
 * @param {*} eventBroadcaster
 * @param {*} testCases
 */
export function emitTestCaseResults(eventBroadcaster, testCases) {
  testCases.forEach(({ steps, status, ...testCase }) => {
    const preparedSteps = []
    const stepEvents = []
    steps.forEach((step, index) => {
      preparedSteps.push({
        sourceLocation: step.sourceLocation,
        actionLocation: step.actionLocation,
      })
      const result = { status: step.status, duration: 1 }
      if (step.status === Status.FAILED) {
        result.exception = step.exception
      }
      stepEvents.push({
        index: index,
        testCase: testCase,
        result: result,
      })
    })

    eventBroadcaster.emit('test-case-prepared', {
      sourceLocation: testCase.sourceLocation,
      steps: preparedSteps,
    })
    stepEvents.forEach(event => {
      eventBroadcaster.emit('test-step-finished', event)
    })
    eventBroadcaster.emit('test-case-finished', {
      sourceLocation: testCase.sourceLocation,
      result: { duration: 1, status: status },
    })
  })
  eventBroadcaster.emit('test-run-finished', {
    result: { duration: 0 },
  })
}
