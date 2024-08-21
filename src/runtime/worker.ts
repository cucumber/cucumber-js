import { EventEmitter } from 'node:events'
import { IdGenerator, TestStepResultStatus } from '@cucumber/messages'
import { AssembledTestCase } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import TestCaseRunner from './test_case_runner'
import { retriesForPickle, shouldCauseFailure } from './helpers'
import { makeRunTestRunHooks, RunsTestRunHooks } from './run_test_run_hooks'
import { RuntimeOptions } from './index'

export class Worker {
  #success: boolean = true
  private readonly runTestRunHooks: RunsTestRunHooks

  constructor(
    private readonly workerId: string | undefined,
    private readonly eventBroadcaster: EventEmitter,
    private readonly newId: IdGenerator.NewId,
    private readonly options: RuntimeOptions,
    private readonly supportCodeLibrary: SupportCodeLibrary
  ) {
    this.runTestRunHooks = makeRunTestRunHooks(
      this.options.dryRun,
      this.supportCodeLibrary.defaultTimeout,
      this.options.worldParameters,
      (name, location) => {
        let message = `${name} hook errored`
        if (this.workerId) {
          message += ` on worker ${this.workerId}`
        }
        message += `, process exiting: ${location}`
        return message
      }
    )
  }

  get success() {
    return this.#success
  }

  async runBeforeAllHooks() {
    await this.runTestRunHooks(
      this.supportCodeLibrary.beforeTestRunHookDefinitions,
      'a BeforeAll'
    )
  }

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
      // TODO move skip logic to coordinator?
      skip: this.options.dryRun || (this.options.failFast && !this.#success),
      filterStackTraces: this.options.filterStacktraces,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.options.worldParameters,
    })

    const status = await testCaseRunner.run()

    if (shouldCauseFailure(status, this.options)) {
      this.#success = false
    }

    return status
  }

  async runAfterAllHooks() {
    await this.runTestRunHooks(
      this.supportCodeLibrary.afterTestRunHookDefinitions,
      'an AfterAll'
    )
  }
}
