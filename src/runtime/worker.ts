import { EventEmitter } from 'node:events'
import {
  IdGenerator,
  TestStepResult,
  TestStepResultStatus,
} from '@cucumber/messages'
import { AssembledTestCase } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import UserCodeRunner from '../user_code_runner'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import { formatLocation } from '../formatter/helpers'
import { retriesForPickle, shouldCauseFailure } from './helpers'
import TestCaseRunner from './test_case_runner'
import { runInTestRunScope } from './scope'
import { formatError } from './format_error'
import { create } from './stopwatch'
import { RuntimeOptions } from './types'

export interface RunHookResult {
  result: TestStepResult
  error?: any
}

export class Worker {
  constructor(
    private readonly workerId: string | undefined,
    private readonly eventBroadcaster: EventEmitter,
    private readonly newId: IdGenerator.NewId,
    private readonly options: RuntimeOptions,
    private readonly supportCodeLibrary: SupportCodeLibrary
  ) {}

  private async runTestRunHook(
    hookDefinition: TestRunHookDefinition
  ): Promise<RunHookResult> {
    const stopwatch = create().start()

    if (this.options.dryRun) {
      const duration = stopwatch.stop().duration()
      return {
        result: {
          duration,
          status: TestStepResultStatus.SKIPPED,
        },
      }
    }

    const context = { parameters: this.options.worldParameters }
    const { error } = await runInTestRunScope({ context }, () =>
      UserCodeRunner.run({
        argsArray: [],
        fn: hookDefinition.code,
        thisArg: context,
        timeoutInMilliseconds: valueOrDefault(
          hookDefinition.options.timeout,
          this.supportCodeLibrary.defaultTimeout
        ),
      })
    )

    const duration = stopwatch.stop().duration()
    let status: TestStepResultStatus
    let details = {}

    if (doesHaveValue(error)) {
      status = TestStepResultStatus.FAILED
      details = formatError(error, this.options.filterStacktraces)
    } else {
      status = TestStepResultStatus.PASSED
    }

    return {
      result: {
        duration,
        status,
        ...details,
      },
      error: this.wrapTestRunHookError(
        'a BeforeAll',
        formatLocation(hookDefinition),
        error
      ),
    }
  }

  private wrapTestRunHookError(
    name: string,
    location: string,
    error: any
  ): any | undefined {
    if (!doesHaveValue(error)) {
      return undefined
    }
    let message = `${name} hook errored`
    if (this.workerId) {
      message += ` on worker ${this.workerId}`
    }
    message += `, process exiting: ${location}`
    return new Error(message, { cause: error })
  }

  async runBeforeAllHooks(): Promise<RunHookResult[]> {
    const results: RunHookResult[] = []
    for (const hookDefinition of this.supportCodeLibrary
      .beforeTestRunHookDefinitions) {
      const result = await this.runTestRunHook(hookDefinition)
      results.push(result)
      if (doesHaveValue(result.error)) {
        throw result.error
      }
    }
    return results
  }

  async runTestCase(
    { gherkinDocument, pickle, testCase }: AssembledTestCase,
    failing: boolean
  ): Promise<boolean> {
    const testCaseRunner = new TestCaseRunner({
      workerId: this.workerId,
      eventBroadcaster: this.eventBroadcaster,
      newId: this.newId,
      gherkinDocument,
      pickle,
      testCase,
      retries: retriesForPickle(pickle, this.options),
      skip: this.options.dryRun || (this.options.failFast && failing),
      filterStackTraces: this.options.filterStacktraces,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.options.worldParameters,
    })

    const status = await testCaseRunner.run()

    return !shouldCauseFailure(status, this.options)
  }

  async runAfterAllHooks(): Promise<RunHookResult[]> {
    const results: RunHookResult[] = []
    const reversed = [
      ...this.supportCodeLibrary.afterTestRunHookDefinitions,
    ].reverse()
    for (const hookDefinition of reversed) {
      const result = await this.runTestRunHook(hookDefinition)
      results.push(result)
      if (doesHaveValue(result.error)) {
        throw result.error
      }
    }
    return results
  }
}
