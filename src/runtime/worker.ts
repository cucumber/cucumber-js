import { EventEmitter } from 'node:events'
import {
  Envelope,
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
import { create, timestamp } from './stopwatch'
import { RuntimeOptions } from './types'

export interface RunHookResult {
  result: TestStepResult
  error?: any
}

export class Worker {
  constructor(
    private readonly testRunStartedId: string | undefined,
    private readonly workerId: string | undefined,
    private readonly eventBroadcaster: EventEmitter,
    private readonly newId: IdGenerator.NewId,
    private readonly options: RuntimeOptions,
    private readonly supportCodeLibrary: SupportCodeLibrary
  ) {}

  private async runTestRunHook(
    hookDefinition: TestRunHookDefinition
  ): Promise<RunHookResult> {
    const testRunHookStartedId = this.newId()
    this.eventBroadcaster.emit('envelope', {
      testRunHookStarted: {
        testRunStartedId: this.testRunStartedId,
        workerId: this.workerId,
        id: testRunHookStartedId,
        hookId: hookDefinition.id,
        timestamp: timestamp(),
      },
    } satisfies Envelope)

    let result: TestStepResult
    let error: any
    if (this.options.dryRun) {
      result = {
        duration: {
          seconds: 0,
          nanos: 0,
        },
        status: TestStepResultStatus.SKIPPED,
      }
    } else {
      const stopwatch = create().start()
      const context = { parameters: this.options.worldParameters }
      const { error: rawError } = await runInTestRunScope({ context }, () =>
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

      if (doesHaveValue(rawError)) {
        result = {
          duration,
          status: TestStepResultStatus.FAILED,
          ...formatError(rawError, this.options.filterStacktraces),
        }
        error = this.wrapTestRunHookError(
          'a BeforeAll',
          formatLocation(hookDefinition),
          rawError
        )
      } else {
        result = {
          duration,
          status: TestStepResultStatus.PASSED,
        }
      }
    }

    this.eventBroadcaster.emit('envelope', {
      testRunHookFinished: {
        testRunHookStartedId,
        result,
        timestamp: timestamp(),
      },
    } satisfies Envelope)

    return {
      result,
      error,
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
