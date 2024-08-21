import { EventEmitter } from 'node:events'
import { IdGenerator, TestStepResultStatus } from '@cucumber/messages'
import { AssembledTestCase } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import TestCaseRunner from './test_case_runner'
import { retriesForPickle, shouldCauseFailure } from './helpers'
import { IRuntimeOptions } from './index'

export class Worker {
  private success: boolean = true

  constructor(
    private readonly workerId: string | undefined,
    private readonly eventBroadcaster: EventEmitter,
    private readonly newId: IdGenerator.NewId,
    private readonly options: IRuntimeOptions,
    private readonly supportCodeLibrary: SupportCodeLibrary
  ) {}

  async runTestCase({
    gherkinDocument,
    pickle,
    testCase,
  }: AssembledTestCase): Promise<TestStepResultStatus> {
    const testCaseRunner = new TestCaseRunner({
      workerId: this.workerId,
      eventBroadcaster: this.eventBroadcaster,
      newId: this.newId,
      gherkinDocument,
      pickle,
      testCase,
      retries: retriesForPickle(pickle, this.options),
      skip: this.options.dryRun || (this.options.failFast && !this.success),
      filterStackTraces: this.options.filterStacktraces,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.options.worldParameters,
    })

    const status = await testCaseRunner.run()

    if (shouldCauseFailure(status, this.options)) {
      this.success = false
    }

    return status
  }
}
