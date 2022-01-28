import { Then } from '../../'
import { World } from '../support/world'
import messages from '@cucumber/messages'
import { expect } from 'chai'

interface TestCaseParser {
  pickles: Record<string, messages.Pickle>
  testCases: Record<string, string>
  running: Set<string>
  testStarts: Record<string, string>
}

function defaultHandlers({
  pickles,
  testCases,
  running,
  testStarts,
}: TestCaseParser): Record<string, Function> {
  return {
    pickle: (p: messages.Pickle) => (pickles[p.id] = p),
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
  envelopes: messages.Envelope[],
  handlers: Record<string, Function>
): void {
  envelopes.forEach((envelope) => {
    for (const key in envelope) {
      ;(handlers[key] || (() => {}))(envelope[key as keyof messages.Envelope])
    }
  })
}

function verifyTandem(
  assertion: (p1: messages.Pickle, p2: messages.Pickle) => void
) {
  return function (this: World): void {
    const running = new Set<string>()
    const pickles: Record<string, messages.Pickle> = {}
    const testCases: Record<string, string> = {}
    const testStarts: Record<string, string> = {}

    const handlers = defaultHandlers({
      pickles,
      running,
      testCases,
      testStarts,
    })

    const originalFn = handlers.testCaseStarted
    handlers.testCaseStarted = (t: messages.TestCaseStarted) => {
      running.forEach((tcId) =>
        assertion(pickles[testCases[tcId]], pickles[testCases[t.testCaseId]])
      )
      originalFn(t)
    }

    parse(this.lastRun.envelopes, handlers)
  }
}

Then(/^it runs tests in order (.+)$/, function (this: World, order: string) {
  const running = new Set<string>()
  const pickles: Record<string, messages.Pickle> = {}
  const testCases: Record<string, string> = {}
  const testStarts: Record<string, string> = {}
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
