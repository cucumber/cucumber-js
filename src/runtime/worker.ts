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
import StepDefinitionSnippetBuilder from '../formatter/step_definition_snippet_builder'
import { retriesForPickle, shouldCauseFailure } from './helpers'
import TestCaseRunner from './test_case_runner'
import { runInTestRunScope } from './scope'
import { formatError } from './format_error'
import { create, timestamp } from './stopwatch'
import { RuntimeOptions } from './types'

export class Worker {
  constructor(
    private readonly testRunStartedId: string,
    private readonly workerId: string | undefined,
    private readonly eventBroadcaster: EventEmitter,
    private readonly newId: IdGenerator.NewId,
    private readonly options: RuntimeOptions,
    private readonly supportCodeLibrary: SupportCodeLibrary,
    private readonly snippetBuilder: StepDefinitionSnippetBuilder
  ) {}

  private async runTestRunHook(
    hookDefinition: TestRunHookDefinition
  ): Promise<boolean> {
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

      if (doesHaveValue(error)) {
        result = {
          duration,
          status: TestStepResultStatus.FAILED,
          ...formatError(error, this.options.filterStacktraces),
        }
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

    return result.status !== TestStepResultStatus.FAILED
  }

  async runBeforeAllHooks(): Promise<boolean> {
    let success = true
    for (const hookDefinition of this.supportCodeLibrary
      .beforeTestRunHookDefinitions) {
      if (!(await this.runTestRunHook(hookDefinition))) {
        success = false
      }
    }
    return success
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
      snippetBuilder: this.snippetBuilder,
    })

    const status = await testCaseRunner.run()

    return !shouldCauseFailure(status, this.options)
  }

  async runAfterAllHooks(): Promise<boolean> {
    let success = true
    const reversed = [
      ...this.supportCodeLibrary.afterTestRunHookDefinitions,
    ].reverse()
    for (const hookDefinition of reversed) {
      if (!(await this.runTestRunHook(hookDefinition))) {
        success = false
      }
    }
    return success
  }
}
