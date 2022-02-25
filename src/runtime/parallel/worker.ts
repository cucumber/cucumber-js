import * as messages from '@cucumber/messages'
import { IdGenerator } from '@cucumber/messages'
import { duration } from 'durations'
import { EventEmitter } from 'events'
import { pathToFileURL } from 'url'
import { isJavaScript } from '../../cli/helpers'
import StackTraceFilter from '../../stack_trace_filter'
import supportCodeLibraryBuilder from '../../support_code_library_builder'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesHaveValue } from '../../value_checker'
import { makeRunTestRunHooks, RunsTestRunHooks } from '../run_test_run_hooks'
import { RealTestRunStopwatch } from '../stopwatch'
import TestCaseRunner from '../test_case_runner'
import {
  ICoordinatorReport,
  IWorkerCommand,
  IWorkerCommandInitialize,
  IWorkerCommandRun,
} from './command_types'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../../importer')
const { uuid } = IdGenerator

type IExitFunction = (exitCode: number, error?: Error, message?: string) => void
type IMessageSender = (command: ICoordinatorReport) => void

export default class Worker {
  private readonly cwd: string
  private readonly exit: IExitFunction

  private readonly id: string
  private readonly eventBroadcaster: EventEmitter
  private filterStacktraces: boolean
  private readonly newId: IdGenerator.NewId
  private readonly sendMessage: IMessageSender
  private readonly stackTraceFilter: StackTraceFilter
  private supportCodeLibrary: ISupportCodeLibrary
  private worldParameters: any
  private runTestRunHooks: RunsTestRunHooks

  constructor({
    cwd,
    exit,
    id,
    sendMessage,
  }: {
    cwd: string
    exit: IExitFunction
    id: string
    sendMessage: IMessageSender
  }) {
    this.id = id
    this.newId = uuid()
    this.cwd = cwd
    this.exit = exit
    this.sendMessage = sendMessage
    this.eventBroadcaster = new EventEmitter()
    this.stackTraceFilter = new StackTraceFilter()
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      this.sendMessage({
        jsonEnvelope: JSON.stringify(envelope),
      })
    })
  }

  async initialize({
    filterStacktraces,
    supportCodeRequiredModules,
    supportCodePaths,
    supportCodeIds,
    options,
  }: IWorkerCommandInitialize): Promise<void> {
    supportCodeRequiredModules.map((module) => require(module))
    supportCodeLibraryBuilder.reset(this.cwd, this.newId)
    for (const codePath of supportCodePaths) {
      if (supportCodeRequiredModules.length || !isJavaScript(codePath)) {
        require(codePath)
      } else {
        await importer(pathToFileURL(codePath))
      }
    }
    this.supportCodeLibrary = supportCodeLibraryBuilder.finalize(supportCodeIds)

    this.worldParameters = options.worldParameters
    this.filterStacktraces = filterStacktraces
    if (this.filterStacktraces) {
      this.stackTraceFilter.filter()
    }
    this.runTestRunHooks = makeRunTestRunHooks(
      options.dryRun,
      this.supportCodeLibrary.defaultTimeout,
      (name, location) =>
        `${name} hook errored on worker ${this.id}, process exiting: ${location}`
    )
    await this.runTestRunHooks(
      this.supportCodeLibrary.beforeTestRunHookDefinitions,
      'a BeforeAll'
    )
    this.sendMessage({ ready: true })
  }

  async finalize(): Promise<void> {
    await this.runTestRunHooks(
      this.supportCodeLibrary.afterTestRunHookDefinitions,
      'an AfterAll'
    )
    if (this.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }
    this.exit(0)
  }

  async receiveMessage(message: IWorkerCommand): Promise<void> {
    if (doesHaveValue(message.initialize)) {
      await this.initialize(message.initialize)
    } else if (message.finalize) {
      await this.finalize()
    } else if (doesHaveValue(message.run)) {
      await this.runTestCase(message.run)
    }
  }

  async runTestCase({
    gherkinDocument,
    pickle,
    testCase,
    elapsed,
    retries,
    skip,
  }: IWorkerCommandRun): Promise<void> {
    const stopwatch = new RealTestRunStopwatch()
    stopwatch.from(duration(elapsed))
    const testCaseRunner = new TestCaseRunner({
      eventBroadcaster: this.eventBroadcaster,
      stopwatch,
      gherkinDocument,
      newId: this.newId,
      pickle,
      testCase,
      retries,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.worldParameters,
    })
    await testCaseRunner.run()
    this.sendMessage({ ready: true })
  }
}
