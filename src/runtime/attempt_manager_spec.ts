import { EventEmitter } from 'node:events'
import {
  type Envelope,
  type GherkinDocument,
  type TestCase,
  TestStepResultStatus,
  TimeConversion,
} from '@cucumber/messages'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import sinon from 'sinon'
import { getPickleWithTags } from '../../test/gherkin_helpers'
import type { AssembledTestCase } from '../assemble'
import { AttemptManager, type RetryDecider, type TestCaseAttemptResult } from './attempt_manager'

async function makeAssembledTestCase(): Promise<AssembledTestCase> {
  return {
    gherkinDocument: {} as GherkinDocument,
    pickle: await getPickleWithTags([]),
    testCase: { id: 'test-case' } as TestCase,
  }
}

function makeManager(shouldRetry: RetryDecider) {
  const envelopes: Envelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (envelope: Envelope) => envelopes.push(envelope))
  const manager = new AttemptManager(eventBroadcaster, shouldRetry)
  return { manager, envelopes }
}

function makeResult(
  status: TestStepResultStatus,
  testCaseStartedId = 'started-1'
): TestCaseAttemptResult {
  return {
    testCaseStartedId,
    worstTestStepResult: {
      status,
      duration: TimeConversion.millisecondsToDuration(0),
    },
    timestamp: { seconds: 1, nanos: 0 },
  }
}

describe('AttemptManager', () => {
  describe('start', () => {
    it('yields the first attempt, carrying the skip decision', async () => {
      const { pickle } = await makeAssembledTestCase()
      const { manager } = makeManager(sinon.fake.resolves(false))

      expect(manager.start(pickle, true)).to.eql({ attempt: 0, skip: true })
    })

    it('throws if the test case is already in progress', async () => {
      const { pickle } = await makeAssembledTestCase()
      const { manager } = makeManager(sinon.fake.resolves(false))

      manager.start(pickle, false)
      expect(() => manager.start(pickle, false)).to.throw('is already in progress')
    })

    it('allows a test case to be started again once finished', async () => {
      const assembledTestCase = await makeAssembledTestCase()
      const { manager } = makeManager(sinon.fake.resolves(false))

      manager.start(assembledTestCase.pickle, false)
      await manager.finish(assembledTestCase, makeResult(TestStepResultStatus.PASSED))
      expect(manager.start(assembledTestCase.pickle, false)).to.eql({ attempt: 0, skip: false })
    })
  })

  describe('finish', () => {
    it('asks whether to retry a failed attempt, with the details of the attempt', async () => {
      const assembledTestCase = await makeAssembledTestCase()
      const shouldRetry = sinon.fake.resolves(true)
      const { manager } = makeManager(shouldRetry)

      manager.start(assembledTestCase.pickle, false)
      const result = makeResult(TestStepResultStatus.FAILED)
      await manager.finish(assembledTestCase, result)

      expect(shouldRetry).to.have.been.calledOnceWithExactly({
        ...assembledTestCase,
        testCaseStartedId: 'started-1',
        attempt: 0,
        result: result.worstTestStepResult,
      })
    })

    it('yields the next attempt and emits testCaseFinished when a retry is granted', async () => {
      const assembledTestCase = await makeAssembledTestCase()
      const { manager, envelopes } = makeManager(sinon.fake.resolves(true))

      manager.start(assembledTestCase.pickle, false)
      const next = await manager.finish(
        assembledTestCase,
        makeResult(TestStepResultStatus.FAILED, 'started-1')
      )

      expect(next).to.eql({ attempt: 1, skip: false })
      expect(envelopes).to.eql([
        {
          testCaseFinished: {
            testCaseStartedId: 'started-1',
            timestamp: { seconds: 1, nanos: 0 },
            willBeRetried: true,
          },
        },
      ])
    })

    it('increments the attempt number across retries', async () => {
      const assembledTestCase = await makeAssembledTestCase()
      const shouldRetry = sinon.fake.resolves(true)
      const { manager } = makeManager(shouldRetry)

      manager.start(assembledTestCase.pickle, false)
      await manager.finish(assembledTestCase, makeResult(TestStepResultStatus.FAILED))
      await manager.finish(assembledTestCase, makeResult(TestStepResultStatus.FAILED))

      expect(shouldRetry.firstCall.args[0].attempt).to.eql(0)
      expect(shouldRetry.secondCall.args[0].attempt).to.eql(1)
    })

    for (const answer of [false, undefined, null]) {
      it(`finishes the test case and emits testCaseFinished when the answer is ${answer}`, async () => {
        const assembledTestCase = await makeAssembledTestCase()
        const { manager, envelopes } = makeManager(sinon.fake.resolves(answer))

        manager.start(assembledTestCase.pickle, false)
        const next = await manager.finish(
          assembledTestCase,
          makeResult(TestStepResultStatus.FAILED, 'started-1')
        )

        expect(next).to.eql(undefined)
        expect(envelopes).to.eql([
          {
            testCaseFinished: {
              testCaseStartedId: 'started-1',
              timestamp: { seconds: 1, nanos: 0 },
              willBeRetried: false,
            },
          },
        ])
      })
    }

    for (const status of [
      TestStepResultStatus.PASSED,
      TestStepResultStatus.SKIPPED,
      TestStepResultStatus.PENDING,
      TestStepResultStatus.UNDEFINED,
      TestStepResultStatus.AMBIGUOUS,
    ]) {
      it(`does not ask about a ${status} attempt`, async () => {
        const assembledTestCase = await makeAssembledTestCase()
        const shouldRetry = sinon.fake.resolves(true)
        const { manager, envelopes } = makeManager(shouldRetry)

        manager.start(assembledTestCase.pickle, false)
        const next = await manager.finish(assembledTestCase, makeResult(status))

        expect(shouldRetry).not.to.have.been.called()
        expect(next).to.eql(undefined)
        expect(envelopes[0].testCaseFinished.willBeRetried).to.eql(false)
      })
    }

    it('does not ask about a skipped test case even if the attempt somehow failed', async () => {
      const assembledTestCase = await makeAssembledTestCase()
      const shouldRetry = sinon.fake.resolves(true)
      const { manager } = makeManager(shouldRetry)

      manager.start(assembledTestCase.pickle, true)
      const next = await manager.finish(assembledTestCase, makeResult(TestStepResultStatus.FAILED))

      expect(shouldRetry).not.to.have.been.called()
      expect(next).to.eql(undefined)
    })

    it('throws if the test case is not in progress', async () => {
      const assembledTestCase = await makeAssembledTestCase()
      const { manager } = makeManager(sinon.fake.resolves(false))

      try {
        await manager.finish(assembledTestCase, makeResult(TestStepResultStatus.PASSED))
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error.message).to.contain('is not in progress')
      }
    })
  })
})
