import type { EventEmitter } from 'node:events'
import {
  type Envelope,
  type Pickle,
  type TestStepResult,
  TestStepResultStatus,
  type Timestamp,
} from '@cucumber/messages'
import type { AssembledTestCase } from '../assemble'
import type { IRetryCandidate } from '../plugin'

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
  worstTestStepResult: TestStepResult
  /** when the runtime finished the attempt */
  timestamp: Timestamp
}

/**
 * Decides whether a failed attempt should be retried
 * @remarks
 * This is how the coordinator layer defers the decision to plugins without
 * the runtime knowing anything about them.
 */
export type RetryDecider = (candidate: IRetryCandidate) => Promise<boolean>

interface TestCaseAttemptsState {
  attempt: number
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
    private readonly shouldRetry: RetryDecider
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
    const state: TestCaseAttemptsState = { attempt: 0, skip }
    this.inProgress.set(pickle.id, state)
    return toSpec(state)
  }

  /**
   * Record the outcome of the attempt in progress for a test case, deciding
   * whether it will be retried and emitting `testCaseFinished` accordingly
   * @returns the next attempt to run, or `undefined` if the test case is done
   */
  async finish(
    assembledTestCase: AssembledTestCase,
    result: TestCaseAttemptResult
  ): Promise<AttemptSpec | undefined> {
    const { pickle } = assembledTestCase
    const state = this.inProgress.get(pickle.id)
    if (!state) {
      throw new Error(`Test case for pickle ${pickle.id} is not in progress`)
    }
    const willBeRetried = await this.decide(assembledTestCase, state, result)
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

  private async decide(
    { gherkinDocument, pickle, testCase }: AssembledTestCase,
    state: TestCaseAttemptsState,
    result: TestCaseAttemptResult
  ): Promise<boolean> {
    // only failures are ever candidates for retry; plugins aren't consulted otherwise
    if (state.skip || result.worstTestStepResult.status !== TestStepResultStatus.FAILED) {
      return false
    }
    const answer = await this.shouldRetry({
      gherkinDocument,
      pickle,
      testCase,
      testCaseStartedId: result.testCaseStartedId,
      attempt: state.attempt,
      result: result.worstTestStepResult,
    })
    return answer === true
  }
}

function toSpec({ attempt, skip }: TestCaseAttemptsState): AttemptSpec {
  return { attempt, skip }
}
