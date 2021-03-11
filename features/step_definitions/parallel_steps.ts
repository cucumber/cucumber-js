import { Then } from '../../'
import { World } from '../support/world'
import _, { Dictionary } from 'lodash'
import { messages } from '@cucumber/messages'
import { expect } from 'chai'

interface TestCaseParser {
  pickles: Dictionary<messages.IPickle>
  testCases: Dictionary<string>
  running: Set<string>
  testStarts: Dictionary<string>
}

function defaultHandlers({
  pickles,
  testCases,
  running,
  testStarts,
}: TestCaseParser): Record<string, Function> {
  return {
    pickle: (p: messages.IPickle) => (pickles[p.id] = p),
    testCase: (t: messages.TestCase) => (testCases[t.id] = t.pickleId),
    testCaseStarted: (t: messages.TestCaseStarted) => {
      running.add(t.testCaseId)
      testStarts[t.id] = t.testCaseId
    },
    testCaseFinished: (t: messages.TestCaseFinished) =>
      running.delete(testStarts[t.testCaseStartedId]),
  }
}

function parse(
  envelopes: messages.IEnvelope[],
  handlers: Record<string, Function>
): void {
  _.each(envelopes, (envelope) =>
    _.forOwn(envelope, (value, key) => {
      ;(handlers[key] || _.noop)(value)
    })
  )
}

Then(/^it runs tests in order (.+)$/, function (this: World, order: string) {
  const running = new Set<string>()
  const pickles: Dictionary<messages.IPickle> = {}
  const testCases: Dictionary<string> = {}
  const testStarts: Dictionary<string> = {}
  const scenarioNames = order.split(/,\s*/)
  const handlers = defaultHandlers({ pickles, running, testCases, testStarts })
  handlers.testCaseStarted = (t: messages.TestCaseStarted) =>
    expect(pickles[testCases[t.testCaseId]].name).to.eq(scenarioNames.shift())
  parse(this.lastRun.envelopes, handlers)
})

Then(/^tandem tests verified$/, function (this: World, assertion: string) {
  const running = new Set<string>()
  const pickles: Dictionary<messages.IPickle> = {}
  const testCases: Dictionary<string> = {}
  const testStarts: Dictionary<string> = {}
  const assertFn = (
    _pickle1: messages.IPickle,
    _pickle2: messages.IPickle
  ): boolean => {
    // eslint-disable-next-line no-eval
    return eval(`
      const { expect } = require('chai')
      ${assertion}
    `)
  }

  const handlers = defaultHandlers({ pickles, running, testCases, testStarts })
  handlers.testCaseStarted = _.wrap(
    handlers.testCaseStarted,
    (fn, t: messages.TestCaseStarted) => {
      running.forEach((tcId) =>
        assertFn(pickles[testCases[tcId]], pickles[testCases[t.testCaseId]])
      )
      fn(t)
    }
  )
  parse(this.lastRun.envelopes, handlers)
})
