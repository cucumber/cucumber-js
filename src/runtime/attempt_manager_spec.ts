import { EventEmitter } from 'node:events'
import { type Envelope, type Pickle, TestStepResultStatus } from '@cucumber/messages'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { getPickleWithTags } from '../../test/gherkin_helpers'
import { buildOptions } from '../../test/runtime_helpers'
import { AttemptManager, type TestCaseAttemptResult } from './attempt_manager'
import type { RuntimeOptions } from './types'

function makeManager(overrides: Partial<RuntimeOptions>) {
  const envelopes: Envelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (envelope: Envelope) => envelopes.push(envelope))
  const manager = new AttemptManager(eventBroadcaster, buildOptions(overrides))
  return { manager, envelopes }
}

function makeResult(
  status: TestStepResultStatus,
  testCaseStartedId = 'started-1'
): TestCaseAttemptResult {
  return {
    testCaseStartedId,
    status,
    timestamp: { seconds: 1, nanos: 0 },
  }
}

/**
 * Drives a test case through attempts that all fail, returning the number of attempts made
 */
function exhaust(manager: AttemptManager, pickle: Pickle, skip = false): number {
  let count = 0
  let spec = manager.start(pickle, skip)
  while (spec) {
    count++
    spec = manager.finish(pickle, makeResult(TestStepResultStatus.FAILED))
  }
  return count
}

describe('AttemptManager', () => {
  describe('number of attempts', () => {
    it('allows a single attempt if options.retry is not set', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({})

      expect(exhaust(manager, pickle)).to.eql(1)
    })

    it('allows options.retry extra attempts if set and no options.retryTagFilter is specified', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({ retry: 2 })

      expect(exhaust(manager, pickle)).to.eql(3)
    })

    it('allows options.retry extra attempts if the pickle tags match options.retryTagFilter', async () => {
      const pickle = await getPickleWithTags(['@retry'])
      const { manager } = makeManager({ retry: 1, retryTagFilter: '@retry' })

      expect(exhaust(manager, pickle)).to.eql(2)
    })

    it('allows a single attempt if the pickle tags do not match options.retryTagFilter', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({ retry: 1, retryTagFilter: '@retry' })

      expect(exhaust(manager, pickle)).to.eql(1)
    })

    it('allows a single attempt when skipping, regardless of options.retry', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({ retry: 2 })

      expect(exhaust(manager, pickle, true)).to.eql(1)
    })
  })

  describe('attempt specs', () => {
    it('yields sequential attempt numbers', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({ retry: 2 })

      expect(manager.start(pickle, false)).to.eql({ attempt: 0, skip: false })
      expect(manager.finish(pickle, makeResult(TestStepResultStatus.FAILED))).to.eql({
        attempt: 1,
        skip: false,
      })
      expect(manager.finish(pickle, makeResult(TestStepResultStatus.FAILED))).to.eql({
        attempt: 2,
        skip: false,
      })
      expect(manager.finish(pickle, makeResult(TestStepResultStatus.FAILED))).to.eql(undefined)
    })

    it('carries the skip decision on the attempt spec', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({ retry: 2 })

      expect(manager.start(pickle, true)).to.eql({ attempt: 0, skip: true })
    })
  })

  describe('finish', () => {
    it('retries a failed attempt only while more attempts remain', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({ retry: 1 })

      manager.start(pickle, false)
      expect(manager.finish(pickle, makeResult(TestStepResultStatus.FAILED))).to.not.eql(undefined)
      expect(manager.finish(pickle, makeResult(TestStepResultStatus.FAILED))).to.eql(undefined)
    })

    for (const status of [
      TestStepResultStatus.PASSED,
      TestStepResultStatus.SKIPPED,
      TestStepResultStatus.PENDING,
      TestStepResultStatus.UNDEFINED,
      TestStepResultStatus.AMBIGUOUS,
    ]) {
      it(`does not retry a ${status} attempt even when more attempts remain`, async () => {
        const pickle = await getPickleWithTags([])
        const { manager } = makeManager({ retry: 1 })

        manager.start(pickle, false)
        expect(manager.finish(pickle, makeResult(status))).to.eql(undefined)
      })
    }

    it('emits testCaseFinished for each attempt with the just-in-time retry decision', async () => {
      const pickle = await getPickleWithTags([])
      const { manager, envelopes } = makeManager({ retry: 1 })

      manager.start(pickle, false)
      manager.finish(pickle, makeResult(TestStepResultStatus.FAILED, 'started-1'))
      manager.finish(pickle, makeResult(TestStepResultStatus.PASSED, 'started-2'))

      expect(envelopes).to.eql([
        {
          testCaseFinished: {
            testCaseStartedId: 'started-1',
            timestamp: { seconds: 1, nanos: 0 },
            willBeRetried: true,
          },
        },
        {
          testCaseFinished: {
            testCaseStartedId: 'started-2',
            timestamp: { seconds: 1, nanos: 0 },
            willBeRetried: false,
          },
        },
      ])
    })

    it('throws if the test case is not in progress', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({})

      expect(() => manager.finish(pickle, makeResult(TestStepResultStatus.PASSED))).to.throw(
        'is not in progress'
      )
    })
  })

  describe('start', () => {
    it('throws if the test case is already in progress', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({})

      manager.start(pickle, false)
      expect(() => manager.start(pickle, false)).to.throw('is already in progress')
    })

    it('allows a test case to be started again once finished', async () => {
      const pickle = await getPickleWithTags([])
      const { manager } = makeManager({})

      manager.start(pickle, false)
      manager.finish(pickle, makeResult(TestStepResultStatus.PASSED))
      expect(manager.start(pickle, false)).to.eql({ attempt: 0, skip: false })
    })
  })
})
