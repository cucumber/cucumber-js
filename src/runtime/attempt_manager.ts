import { type Pickle, TestStepResultStatus } from '@cucumber/messages'
import { PickleTagFilter } from '../pickle_filter'
import type { RuntimeOptions } from './types'

/**
 * Describes a single attempt of a test case, as instructed by the adapter layer
 */
export interface AttemptSpec {
  attempt: number
  moreAttemptsRemaining: boolean
  skip: boolean
}

export function retriesForPickle(pickle: Pickle, options: RuntimeOptions): number {
  if (!options.retry) {
    return 0
  }
  const retries = options.retry
  if (retries === 0) {
    return 0
  }
  const retryTagFilter = options.retryTagFilter
  if (!retryTagFilter) {
    return retries
  }
  const pickleTagFilter = new PickleTagFilter(retryTagFilter)
  if (pickleTagFilter.matchesAllTagExpressions(pickle)) {
    return retries
  }
  return 0
}

/**
 * The one rule for whether a finished attempt gets another go
 */
export function willBeRetried(
  status: TestStepResultStatus,
  moreAttemptsRemaining: boolean
): boolean {
  return status === TestStepResultStatus.FAILED && moreAttemptsRemaining
}

/**
 * Tracks the attempts for a single test case
 * @remarks
 * `skip` is decided once, before the first attempt, and carried on every
 * attempt spec so that it cannot be re-decided mid-retries.
 */
export class TestCaseAttempts {
  private attempt = -1

  constructor(
    private readonly maxAttempts: number,
    private readonly skip: boolean
  ) {}

  next(): AttemptSpec {
    if (!this.moreAttemptsRemaining()) {
      throw new Error('No attempts remaining')
    }
    this.attempt++
    return {
      attempt: this.attempt,
      moreAttemptsRemaining: this.moreAttemptsRemaining(),
      skip: this.skip,
    }
  }

  /**
   * Records the result of the current attempt
   * @returns whether the test case will be attempted again
   */
  finish(status: TestStepResultStatus): boolean {
    if (this.attempt < 0) {
      throw new Error('No attempt in progress')
    }
    return willBeRetried(status, this.moreAttemptsRemaining())
  }

  private moreAttemptsRemaining(): boolean {
    return this.attempt + 1 < this.maxAttempts
  }
}

/**
 * Decides how many attempts each test case gets for a test run
 */
export class AttemptManager {
  constructor(private readonly options: RuntimeOptions) {}

  track(pickle: Pickle, skip: boolean): TestCaseAttempts {
    return new TestCaseAttempts(1 + (skip ? 0 : retriesForPickle(pickle, this.options)), skip)
  }
}
