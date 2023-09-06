import * as messages from '@cucumber/messages'
import { IdGenerator } from '@cucumber/messages'
import { EventEmitter } from 'events'
import { pathToFileURL } from 'url'
import supportCodeLibraryBuilder from '../../support_code_library_builder'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesHaveValue } from '../../value_checker'
import { makeRunTestRunHooks, RunsTestRunHooks } from '../run_test_run_hooks'
import { create } from '../stopwatch'
import TestCaseRunner from '../test_case_runner'
import {
  ICoordinatorReport,
  IWorkerCommand,
  IWorkerCommandInitialize,
  IWorkerCommandRun,
} from './command_types'
import tryRequire from '../../try_require'

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
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      // assign `workerId` property only for the `testCaseStarted` message
      if (envelope.testCaseStarted) {
        envelope.testCaseStarted.workerId = this.id
      }
      this.sendMessage({ jsonEnvelope: JSON.stringify(envelope) })
    })
  }

  async initialize({
    filterStacktraces,
    requireModules,
    requirePaths,
    importPaths,
    supportCodeIds,
    options,
  }: IWorkerCommandInitialize): Promise<void> {
    supportCodeLibraryBuilder.reset(this.cwd, this.newId, {
      requireModules,
      requirePaths,
      importPaths,
    })
    requireModules.map((module) => tryRequire(module))
    requirePaths.map((module) => tryRequire(module))
    for (const path of importPaths) {
      await importer(pathToFileURL(path))
    }
    this.supportCodeLibrary = supportCodeLibraryBuilder.finalize(supportCodeIds)

    this.worldParameters = options.worldParameters
    this.filterStacktraces = filterStacktraces
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
    const stopwatch = create(elapsed)
    const testCaseRunner = new TestCaseRunner({
      eventBroadcaster: this.eventBroadcaster,
      stopwatch,
      gherkinDocument,
      newId: this.newId,
      pickle,
      testCase,
      retries,
      skip,
      filterStackTraces: this.filterStacktraces,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.worldParameters,
    })
    await testCaseRunner.run()
    this.sendMessage({ ready: true })
  }
}
