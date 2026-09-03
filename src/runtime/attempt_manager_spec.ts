import { TestStepResultStatus } from '@cucumber/messages'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { getPickleWithTags } from '../../test/gherkin_helpers'
import { buildOptions } from '../../test/runtime_helpers'
import { AttemptManager, type TestCaseAttempts } from './attempt_manager'

/**
 * Drives a test case through attempts that all fail, returning the number of attempts made
 */
function exhaust(attempts: TestCaseAttempts): number {
  let count = 0
  do {
    attempts.next()
    count++
  } while (attempts.finish(TestStepResultStatus.FAILED))
  return count
}

describe('AttemptManager', () => {
  describe('track', () => {
    it('allows a single attempt if options.retry is not set', async () => {
      const pickle = await getPickleWithTags([])
      const manager = new AttemptManager(buildOptions({}))

      expect(exhaust(manager.track(pickle, false))).to.eql(1)
    })

    it('allows options.retry extra attempts if set and no options.retryTagFilter is specified', async () => {
      const pickle = await getPickleWithTags([])
      const manager = new AttemptManager(buildOptions({ retry: 2 }))

      expect(exhaust(manager.track(pickle, false))).to.eql(3)
    })

    it('allows options.retry extra attempts if the pickle tags match options.retryTagFilter', async () => {
      const pickle = await getPickleWithTags(['@retry'])
      const manager = new AttemptManager(buildOptions({ retry: 1, retryTagFilter: '@retry' }))

      expect(exhaust(manager.track(pickle, false))).to.eql(2)
    })

    it('allows a single attempt if the pickle tags do not match options.retryTagFilter', async () => {
      const pickle = await getPickleWithTags([])
      const manager = new AttemptManager(buildOptions({ retry: 1, retryTagFilter: '@retry' }))

      expect(exhaust(manager.track(pickle, false))).to.eql(1)
    })

    it('allows a single attempt when skipping, regardless of options.retry', async () => {
      const pickle = await getPickleWithTags([])
      const manager = new AttemptManager(buildOptions({ retry: 2 }))

      expect(exhaust(manager.track(pickle, true))).to.eql(1)
    })
  })

  describe('TestCaseAttempts', () => {
    async function track(retry: number, skip = false) {
      const pickle = await getPickleWithTags([])
      return new AttemptManager(buildOptions({ retry })).track(pickle, skip)
    }

    it('yields sequential attempt specs, flagging when no more attempts remain', async () => {
      const attempts = await track(2)

      expect(attempts.next()).to.eql({ attempt: 0, moreAttemptsRemaining: true, skip: false })
      attempts.finish(TestStepResultStatus.FAILED)
      expect(attempts.next()).to.eql({ attempt: 1, moreAttemptsRemaining: true, skip: false })
      attempts.finish(TestStepResultStatus.FAILED)
      expect(attempts.next()).to.eql({ attempt: 2, moreAttemptsRemaining: false, skip: false })
    })

    it('carries the skip decision on every attempt spec', async () => {
      const attempts = await track(2, true)

      expect(attempts.next()).to.eql({ attempt: 0, moreAttemptsRemaining: false, skip: true })
    })

    it('retries a failed attempt only while more attempts remain', async () => {
      const attempts = await track(1)

      attempts.next()
      expect(attempts.finish(TestStepResultStatus.FAILED)).to.eql(true)
      attempts.next()
      expect(attempts.finish(TestStepResultStatus.FAILED)).to.eql(false)
    })

    for (const status of [
      TestStepResultStatus.PASSED,
      TestStepResultStatus.SKIPPED,
      TestStepResultStatus.PENDING,
      TestStepResultStatus.UNDEFINED,
      TestStepResultStatus.AMBIGUOUS,
    ]) {
      it(`does not retry a ${status} attempt even when more attempts remain`, async () => {
        const attempts = await track(1)

        attempts.next()
        expect(attempts.finish(status)).to.eql(false)
      })
    }

    it('throws if asked for an attempt when none remain', async () => {
      const attempts = await track(0)

      attempts.next()
      attempts.finish(TestStepResultStatus.FAILED)
      expect(() => attempts.next()).to.throw('No attempts remaining')
    })

    it('throws if asked to finish before any attempt has started', async () => {
      const attempts = await track(0)

      expect(() => attempts.finish(TestStepResultStatus.FAILED)).to.throw('No attempt in progress')
    })
  })
})
