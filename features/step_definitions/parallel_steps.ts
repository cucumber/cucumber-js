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

function verifyTandem(
  assertion: (p1: messages.IPickle, p2: messages.IPickle) => void
) {
  return function (this: World): void {
    const running = new Set<string>()
    const pickles: Dictionary<messages.IPickle> = {}
    const testCases: Dictionary<string> = {}
    const testStarts: Dictionary<string> = {}

    const handlers = defaultHandlers({
      pickles,
      running,
      testCases,
      testStarts,
    })
    handlers.testCaseStarted = _.wrap(
      handlers.testCaseStarted,
      (fn, t: messages.TestCaseStarted) => {
        running.forEach((tcId) =>
          assertion(pickles[testCases[tcId]], pickles[testCases[t.testCaseId]])
        )
        fn(t)
      }
    )
    parse(this.lastRun.envelopes, handlers)
  }
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

Then(
  /^no tests ran in tandem$/,
  verifyTandem(() =>
    expect.fail('No tests should have executed at the same time')
  )
)

Then(
  /^tandem tests have unique first tag$/,
  verifyTandem((p1, p2) => expect(p1.tags[0].name).to.not.eq(p2.tags[0].name))
)
