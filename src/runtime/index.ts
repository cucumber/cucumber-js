import _, { clone } from 'lodash'
import { EventDataCollector, formatLocation } from '../formatter/helpers'
import bluebird from 'bluebird'
import StackTraceFilter from '../stack_trace_filter'
import Status from '../status'
import UserCodeRunner from '../user_code_runner'
import VError from 'verror'
import { retriesForPickle } from './helpers'
import { IdGenerator, messages } from '@cucumber/messages'
import PickleRunner from './pickle_runner'
import { EventEmitter } from 'events'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import {
  ITestRunStopwatch,
  PredictableTestRunStopwatch,
  RealTestRunStopwatch,
} from './stopwatch'

export interface INewRuntimeOptions {
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  newId: IdGenerator.NewId
  options: IRuntimeOptions
  pickleIds: string[]
  supportCodeLibrary: ISupportCodeLibrary
}

export interface IRuntimeOptions {
  dryRun: boolean
  predictableIds: boolean
  failFast: boolean
  filterStacktraces: boolean
  retry: number
  retryTagFilter: string
  strict: boolean
  worldParameters: any
}

export default class Runtime {
  private readonly eventBroadcaster: EventEmitter
  private readonly eventDataCollector: EventDataCollector
  private readonly stopwatch: ITestRunStopwatch
  private readonly newId: IdGenerator.NewId
  private readonly options: IRuntimeOptions
  private readonly pickleIds: string[]
  private readonly stackTraceFilter: StackTraceFilter
  private readonly supportCodeLibrary: ISupportCodeLibrary
  private success: boolean

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
    this.stopwatch = options.predictableIds
      ? new PredictableTestRunStopwatch()
      : new RealTestRunStopwatch()
    this.newId = newId
    this.options = options
    this.pickleIds = pickleIds
    this.stackTraceFilter = new StackTraceFilter()
    this.supportCodeLibrary = supportCodeLibrary
    this.success = true
  }

  async runTestRunHooks(
    definitions: TestRunHookDefinition[],
    name: string
  ): Promise<void> {
    if (this.options.dryRun) {
      return
    }
    await bluebird.each(
      definitions,
      async (hookDefinition: TestRunHookDefinition) => {
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
    )
  }

  async runPickle(pickleId: string): Promise<void> {
    const pickle = this.eventDataCollector.getPickle(pickleId)
    const retries = retriesForPickle(pickle, this.options)
    const skip = this.options.dryRun || (this.options.failFast && !this.success)
    const pickleRunner = new PickleRunner({
      eventBroadcaster: this.eventBroadcaster,
      stopwatch: this.stopwatch,
      gherkinDocument: this.eventDataCollector.getGherkinDocument(pickle.uri),
      newId: this.newId,
      pickle,
      retries,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.options.worldParameters,
    })
    const testResult = await pickleRunner.run()
    if (this.shouldCauseFailure(testResult.status)) {
      this.success = false
    }
  }

  async start(): Promise<boolean> {
    if (this.options.filterStacktraces) {
      this.stackTraceFilter.filter()
    }
    this.eventBroadcaster.emit(
      'envelope',
      new messages.Envelope({
        testRunStarted: {
          timestamp: this.stopwatch.timestamp(),
        },
      })
    )
    this.stopwatch.start()
    await this.runTestRunHooks(
      this.supportCodeLibrary.beforeTestRunHookDefinitions,
      'a BeforeAll'
    )
    await bluebird.each(this.pickleIds, this.runPickle.bind(this))
    await this.runTestRunHooks(
      clone(this.supportCodeLibrary.afterTestRunHookDefinitions).reverse(),
      'an AfterAll'
    )
    this.stopwatch.stop()
    this.eventBroadcaster.emit(
      'envelope',
      messages.Envelope.fromObject({
        testRunFinished: {
          timestamp: this.stopwatch.timestamp(),
        },
      })
    )
    if (this.options.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }
    return this.success
  }

  shouldCauseFailure(
    status: messages.TestStepFinished.TestStepResult.Status
  ): boolean {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }
}
