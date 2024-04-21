import { EventEmitter } from 'node:events'
import * as messages from '@cucumber/messages'
import { IdGenerator } from '@cucumber/messages'
import { JsonObject } from 'type-fest'
import { EventDataCollector } from '../formatter/helpers'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { assembleTestCases } from './assemble_test_cases'
import { retriesForPickle, shouldCauseFailure } from './helpers'
import { makeRunTestRunHooks, RunsTestRunHooks } from './run_test_run_hooks'
import { IStopwatch, create } from './stopwatch'
import TestCaseRunner from './test_case_runner'

export interface IRuntime {
  start: () => Promise<boolean>
}

export interface INewRuntimeOptions {
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  newId: IdGenerator.NewId
  options: IRuntimeOptions
  pickleIds: string[]
  supportCodeLibrary: SupportCodeLibrary
}

export interface IRuntimeOptions {
  dryRun: boolean
  failFast: boolean
  filterStacktraces: boolean
  retry: number
  retryTagFilter: string
  strict: boolean
  worldParameters: JsonObject
}

export default class Runtime implements IRuntime {
  private readonly eventBroadcaster: EventEmitter
  private readonly eventDataCollector: EventDataCollector
  private readonly stopwatch: IStopwatch
  private readonly newId: IdGenerator.NewId
  private readonly options: IRuntimeOptions
  private readonly pickleIds: string[]
  private readonly supportCodeLibrary: SupportCodeLibrary
  private success: boolean
  private readonly runTestRunHooks: RunsTestRunHooks

  constructor({
    eventBroadcaster,
    eventDataCollector,
    newId,
    options,
    pickleIds,
    supportCodeLibrary,
  }: INewRuntimeOptions) {
    this.eventBroadcaster = eventBroadcaster
    this.eventDataCollector = eventDataCollector
    this.stopwatch = create()
    this.newId = newId
    this.options = options
    this.pickleIds = pickleIds
    this.supportCodeLibrary = supportCodeLibrary
    this.success = true
    this.runTestRunHooks = makeRunTestRunHooks(
      this.options.dryRun,
      this.supportCodeLibrary.defaultTimeout,
      this.options.worldParameters,
      (name, location) => `${name} hook errored, process exiting: ${location}`
    )
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
      filterStackTraces: this.options.filterStacktraces,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.options.worldParameters,
    })
    const status = await testCaseRunner.run()
    if (shouldCauseFailure(status, this.options)) {
      this.success = false
    }
  }

  async start(): Promise<boolean> {
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
    return this.success
  }
}
