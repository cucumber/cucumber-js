import type { EventEmitter } from 'node:events'
import {
  type Envelope,
  type Pickle,
  TestStepResultStatus,
  type Timestamp,
} from '@cucumber/messages'
import { PickleTagFilter } from '../pickle_filter'
import type { RuntimeOptions } from './types'

/**
 * Describes a single attempt of a test case, as instructed by the adapter layer
 */
export interface AttemptSpec {
  attempt: number
  skip: boolean
}

/**
 * What the runtime reports back after running a single attempt
 */
export interface TestCaseAttemptResult {
  testCaseStartedId: string
  /** the worst step result of the attempt */
  status: TestStepResultStatus
  /** when the runtime finished the attempt */
  timestamp: Timestamp
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

interface TestCaseAttemptsState {
  attempt: number
  maxAttempts: number
  skip: boolean
}

/**
 * The single source of truth for whether a test case will be retried
 * @remarks
 * Lives in the coordinator layer with the whole run in view. The runtime never
 * decides anything about retry: it runs the attempt it's given and reports back,
 * and the decision (plus the `testCaseFinished` envelope that carries it) is
 * made here, just in time, once the attempt has actually finished.
 */
export class AttemptManager {
  private readonly inProgress: Map<string, TestCaseAttemptsState> = new Map()

  constructor(
    private readonly eventBroadcaster: EventEmitter,
    private readonly options: RuntimeOptions
  ) {}

  /**
   * Begin attempting a test case
   * @remarks
   * `skip` is decided once, here, and carried on every attempt for the test case.
   * @returns the first attempt to run
   */
  start(pickle: Pickle, skip: boolean): AttemptSpec {
    if (this.inProgress.has(pickle.id)) {
      throw new Error(`Test case for pickle ${pickle.id} is already in progress`)
    }
    const state: TestCaseAttemptsState = {
      attempt: 0,
      maxAttempts: 1 + (skip ? 0 : retriesForPickle(pickle, this.options)),
      skip,
    }
    this.inProgress.set(pickle.id, state)
    return toSpec(state)
  }

  /**
   * Record the outcome of the attempt in progress for a test case, deciding
   * whether it will be retried and emitting `testCaseFinished` accordingly
   * @returns the next attempt to run, or `undefined` if the test case is done
   */
  finish(pickle: Pickle, result: TestCaseAttemptResult): AttemptSpec | undefined {
    const state = this.inProgress.get(pickle.id)
    if (!state) {
      throw new Error(`Test case for pickle ${pickle.id} is not in progress`)
    }
    const willBeRetried =
      result.status === TestStepResultStatus.FAILED && state.attempt + 1 < state.maxAttempts
    this.eventBroadcaster.emit('envelope', {
      testCaseFinished: {
        testCaseStartedId: result.testCaseStartedId,
        timestamp: result.timestamp,
        willBeRetried,
      },
    } satisfies Envelope)
    if (!willBeRetried) {
      this.inProgress.delete(pickle.id)
      return undefined
    }
    state.attempt++
    return toSpec(state)
  }
}

function toSpec({ attempt, skip }: TestCaseAttemptsState): AttemptSpec {
  return { attempt, skip }
}
