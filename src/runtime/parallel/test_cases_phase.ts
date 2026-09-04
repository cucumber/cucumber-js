import type { Pickle } from '@cucumber/messages'
import type { AssembledTestCase } from '../../assemble'
import type { ILogger } from '../../environment'
import type { ParallelAssignmentValidator } from '../../support_code_library_builder/types'
import type { AttemptManager, AttemptSpec } from '../attempt_manager'
import { shouldCauseFailure } from '../helpers'
import type { RuntimeOptions } from '../types'
import type { Phase, RunTestCaseAttemptCommand, TestCaseAttemptFinishedEvent } from './types'

export class TestCasesPhase
  implements Phase<RunTestCaseAttemptCommand, TestCaseAttemptFinishedEvent>
{
  private failing = false
  private idleInterventions = 0
  private readonly queue: Array<AssembledTestCase> = []
  private readonly running: Set<Pickle> = new Set()

  constructor(
    private readonly resolve: (success: boolean) => void,
    readonly reject: (reason: unknown) => void,
    private readonly logger: ILogger,
    private readonly options: RuntimeOptions,
    private readonly attemptManager: AttemptManager,
    private readonly canAssign: ParallelAssignmentValidator,
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ) {
    // If there's nothing to run, no worker will ever be issued a command, so no FINISHED
    // event will ever arrive to trigger settlement via `next()` - settle right away instead.
    if (assembledTestCases.length === 0) {
      this.resolve(true)
    }
    this.queue.push(...assembledTestCases)
  }

  fill(): RunTestCaseAttemptCommand | undefined {
    return this.select()
  }

  next(
    command: RunTestCaseAttemptCommand,
    event: TestCaseAttemptFinishedEvent
  ): RunTestCaseAttemptCommand | undefined {
    const { pickle } = command.assembledTestCase
    const nextAttempt = this.attemptManager.finish(pickle, event.result)
    if (nextAttempt) {
      // Retry straight away on the same worker. The pickle stays in `running`,
      // so `canAssign` continues to treat it as in progress throughout.
      return this.attempt(command.assembledTestCase, nextAttempt)
    }
    this.running.delete(pickle)
    // Only the final attempt's outcome counts towards fail-fast
    if (shouldCauseFailure(event.result.status, this.options)) {
      this.failing = true
    }
    if (this.queue.length === 0 && this.running.size === 0) {
      if (this.idleInterventions > 0) {
        this.logger.warn(
          `WARNING: All workers went idle ${this.idleInterventions} time(s). Consider revising handler passed to setParallelCanAssign.`
        )
      }
      this.resolve(!this.failing)
      return undefined
    }
    return this.select()
  }

  private select(): RunTestCaseAttemptCommand | undefined {
    if (this.queue.length === 0) {
      return undefined
    }
    for (const assembledTestCase of this.queue) {
      if (this.canAssign(assembledTestCase.pickle, [...this.running])) {
        return this.dequeue(assembledTestCase)
      }
    }
    if (this.running.size === 0) {
      this.idleInterventions++
      return this.dequeue(this.queue.at(0))
    }
    return undefined
  }

  private dequeue(assembledTestCase: AssembledTestCase): RunTestCaseAttemptCommand {
    this.queue.splice(this.queue.indexOf(assembledTestCase), 1)
    const { pickle } = assembledTestCase
    // Skip is decided once per test case, before its first attempt
    const skip = this.options.dryRun || (this.options.failFast && this.failing)
    const firstAttempt = this.attemptManager.start(pickle, skip)
    this.running.add(pickle)
    return this.attempt(assembledTestCase, firstAttempt)
  }

  private attempt(
    assembledTestCase: AssembledTestCase,
    spec: AttemptSpec
  ): RunTestCaseAttemptCommand {
    return {
      type: 'TEST_CASE_ATTEMPT',
      assembledTestCase,
      ...spec,
    }
  }
}
