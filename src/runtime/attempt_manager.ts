import type { EventEmitter } from 'node:events'
import {
  type Envelope,
  type Pickle,
  type TestCaseFinished,
  type TestCaseStarted,
  type TestStepResult,
  TestStepResultStatus,
} from '@cucumber/messages'
import type { AssembledTestCase } from '../assemble'
import type { RetryCandidate } from '../plugin'

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
  testCaseStarted: TestCaseStarted
  /** ready to emit once the consumer has decorated it with `willBeRetried` */
  testCaseFinished: Omit<TestCaseFinished, 'willBeRetried'>
  /** the worst step result of the attempt */
  worstTestStepResult: TestStepResult
}

/**
 * Decides whether a failed attempt should be retried
 * @remarks
 * This is how the coordinator layer defers the decision to plugins without
 * the runtime knowing anything about them.
 */
export type RetryDecider = (candidate: RetryCandidate) => Promise<boolean>

/**
 * The single source of truth for whether a test case will be retried
 * @remarks
 * Lives in the coordinator layer with the whole run in view. The runtime never
 * decides anything about retry: it runs the attempt it's given and reports back,
 * and the decision (plus the `testCaseFinished` envelope that carries it) is
 * made here, just in time, once the attempt has actually finished.
 */
export class AttemptManager {
  private readonly inProgress: Map<string, { skip: boolean }> = new Map()

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
    this.inProgress.set(pickle.id, { skip })
    return { attempt: 0, skip }
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
    const willBeRetried = await this.decide(assembledTestCase, state.skip, result)
    this.eventBroadcaster.emit('envelope', {
      testCaseFinished: {
        ...result.testCaseFinished,
        willBeRetried,
      },
    } satisfies Envelope)
    if (!willBeRetried) {
      this.inProgress.delete(pickle.id)
      return undefined
    }
    return { attempt: result.testCaseStarted.attempt + 1, skip: state.skip }
  }

  private async decide(
    { gherkinDocument, pickle, testCase }: AssembledTestCase,
    skip: boolean,
    { testCaseStarted, worstTestStepResult }: TestCaseAttemptResult
  ): Promise<boolean> {
    // only failures are ever candidates for retry; plugins aren't consulted otherwise
    if (skip || worstTestStepResult.status !== TestStepResultStatus.FAILED) {
      return false
    }
    const answer = await this.shouldRetry({
      gherkinDocument,
      pickle,
      testCase,
      testCaseStarted,
      result: worstTestStepResult,
    })
    return answer === true
  }
}
