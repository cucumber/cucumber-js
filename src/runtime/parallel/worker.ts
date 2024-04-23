import { EventEmitter } from 'node:events'
import { pathToFileURL } from 'node:url'
import { register } from 'node:module'
import * as messages from '@cucumber/messages'
import { IdGenerator } from '@cucumber/messages'
import { JsonObject } from 'type-fest'
import supportCodeLibraryBuilder from '../../support_code_library_builder'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesHaveValue } from '../../value_checker'
import { makeRunTestRunHooks, RunsTestRunHooks } from '../run_test_run_hooks'
import { create } from '../stopwatch'
import TestCaseRunner from '../test_case_runner'
import tryRequire from '../../try_require'
import {
  ICoordinatorReport,
  IWorkerCommand,
  IWorkerCommandInitialize,
  IWorkerCommandRun,
} from './command_types'

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
  private supportCodeLibrary: SupportCodeLibrary
  private worldParameters: JsonObject
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
      this.sendMessage({ jsonEnvelope: envelope })
    })
  }

  async initialize({
    supportCodeCoordinates,
    supportCodeIds,
    options,
  }: IWorkerCommandInitialize): Promise<void> {
    supportCodeLibraryBuilder.reset(
      this.cwd,
      this.newId,
      supportCodeCoordinates
    )
    supportCodeCoordinates.requireModules.map((module) => tryRequire(module))
    supportCodeCoordinates.requirePaths.map((module) => tryRequire(module))
    for (const specifier of supportCodeCoordinates.loaders) {
      register(specifier, pathToFileURL('./'))
    }
    for (const path of supportCodeCoordinates.importPaths) {
      await import(pathToFileURL(path).toString())
    }
    this.supportCodeLibrary = supportCodeLibraryBuilder.finalize(supportCodeIds)

    this.worldParameters = options.worldParameters
    this.filterStacktraces = options.filterStacktraces
    this.runTestRunHooks = makeRunTestRunHooks(
      options.dryRun,
      this.supportCodeLibrary.defaultTimeout,
      this.worldParameters,
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
      workerId: this.id,
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
