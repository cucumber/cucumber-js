import { Pickle } from '@cucumber/messages'
import { AssembledTestCase } from '../../assemble'
import { ILogger } from '../../environment'
import { ParallelAssignmentValidator } from '../../support_code_library_builder/types'
import { FinishedEvent, Phase, RunTestCaseCommand } from './types'

export class TestCasesPhase implements Phase<RunTestCaseCommand> {
  private failing = false
  private idleInterventions = 0
  private readonly queue: Array<AssembledTestCase> = []
  private readonly running: Set<Pickle> = new Set()

  constructor(
    private readonly resolve: (success: boolean) => void,
    readonly reject: (reason: unknown) => void,
    private readonly logger: ILogger,
    private readonly canAssign: ParallelAssignmentValidator,
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ) {
    this.queue.push(...assembledTestCases)
  }

  fill(): RunTestCaseCommand | undefined {
    return this.select()
  }

  next(
    command: RunTestCaseCommand,
    event: FinishedEvent
  ): RunTestCaseCommand | undefined {
    if (!event.success) {
      this.failing = true
    }
    this.running.delete(command.assembledTestCase.pickle)
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

  private select(): RunTestCaseCommand | undefined {
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

  private dequeue(assembledTestCase: AssembledTestCase): RunTestCaseCommand {
    this.queue.splice(this.queue.indexOf(assembledTestCase), 1)
    this.running.add(assembledTestCase.pickle)
    return {
      type: 'TEST_CASE',
      assembledTestCase,
      failing: this.failing,
    }
  }
}
