import { EventDataCollector, formatLocation } from '../formatter/helpers'
import StackTraceFilter from '../stack_trace_filter'
import UserCodeRunner from '../user_code_runner'
import VError from 'verror'
import { retriesForPickle, shouldCauseFailure } from './helpers'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import TestCaseRunner from './test_case_runner'
import { EventEmitter } from 'events'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import { ITestRunStopwatch, RealTestRunStopwatch } from './stopwatch'
import { assembleTestCases } from './assemble_test_cases'

export interface IRuntime {
  start: () => Promise<boolean>
}

export interface IRuntimeOptions {
  dryRun: boolean
  failFast: boolean
  filterStacktraces: boolean
  retry: number
  retryTagFilter: string
  strict: boolean
  worldParameters: any
}

export const DEFAULT_RUNTIME_OPTIONS: IRuntimeOptions = {
  dryRun: false,
  failFast: false,
  filterStacktraces: true,
  retry: 0,
  retryTagFilter: '',
  strict: true,
  worldParameters: {},
}

export default class Runtime implements IRuntime {
  private readonly stopwatch: ITestRunStopwatch
  private readonly stackTraceFilter: StackTraceFilter
  private success: boolean

  constructor(
    private readonly eventBroadcaster: EventEmitter,
    private readonly eventDataCollector: EventDataCollector,
    private readonly newId: IdGenerator.NewId,
    private readonly pickleIds: string[],
    private readonly supportCodeLibrary: ISupportCodeLibrary,
    private readonly options: IRuntimeOptions
  ) {
    this.stopwatch = new RealTestRunStopwatch()
    this.stackTraceFilter = new StackTraceFilter()
    this.success = true
  }

  async runTestRunHooks(
    definitions: TestRunHookDefinition[],
    name: string
  ): Promise<void> {
    if (this.options.dryRun) {
      return
    }
    for (const hookDefinition of definitions) {
      const { error } = await UserCodeRunner.run({
        argsArray: [],
        fn: hookDefinition.code,
        thisArg: null,
        timeoutInMilliseconds: valueOrDefault(
          hookDefinition.options.timeout,
          this.supportCodeLibrary.defaultTimeout
        ),
      })
      if (doesHaveValue(error)) {
        const location = formatLocation(hookDefinition)
        throw new VError(
          error,
          `${name} hook errored, process exiting: ${location}`
        )
      }
    }
  }

  async runTestCase(
    pickleId: string,
    testCase: messages.TestCase
  ): Promise<void> {
    const pickle = this.eventDataCollector.getPickle(pickleId)
    const retries = retriesForPickle(pickle, this.options)
    const skip = this.options.dryRun || (this.options.failFast && !this.success)
    const testCaseRunner = new TestCaseRunner({
      eventBroadcaster: this.eventBroadcaster,
      stopwatch: this.stopwatch,
      gherkinDocument: this.eventDataCollector.getGherkinDocument(pickle.uri),
      newId: this.newId,
      pickle,
      testCase,
      retries,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.options.worldParameters,
    })
    const status = await testCaseRunner.run()
    if (shouldCauseFailure(status, this.options)) {
      this.success = false
    }
  }

  async start(): Promise<boolean> {
    if (this.options.filterStacktraces) {
      this.stackTraceFilter.filter()
    }
    const testRunStarted: messages.Envelope = {
      testRunStarted: {
        timestamp: this.stopwatch.timestamp(),
      },
    }
    this.eventBroadcaster.emit('envelope', testRunStarted)
    this.stopwatch.start()
    await this.runTestRunHooks(
      this.supportCodeLibrary.beforeTestRunHookDefinitions,
      'a BeforeAll'
    )
    const assembledTestCases = await assembleTestCases({
      eventBroadcaster: this.eventBroadcaster,
      newId: this.newId,
      pickles: this.pickleIds.map((pickleId) =>
        this.eventDataCollector.getPickle(pickleId)
      ),
      supportCodeLibrary: this.supportCodeLibrary,
    })
    for (const pickleId of this.pickleIds) {
      await this.runTestCase(pickleId, assembledTestCases[pickleId])
    }
    await this.runTestRunHooks(
      this.supportCodeLibrary.afterTestRunHookDefinitions.slice(0).reverse(),
      'an AfterAll'
    )
    this.stopwatch.stop()
    const testRunFinished: messages.Envelope = {
      testRunFinished: {
        timestamp: this.stopwatch.timestamp(),
        success: this.success,
      },
    }
    this.eventBroadcaster.emit('envelope', testRunFinished)
    if (this.options.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }
    return this.success
  }
}
