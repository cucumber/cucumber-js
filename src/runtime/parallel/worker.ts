import { EventEmitter } from 'node:events'
import { pathToFileURL } from 'node:url'
import { register } from 'node:module'
import { Envelope, IdGenerator } from '@cucumber/messages'
import supportCodeLibraryBuilder from '../../support_code_library_builder'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import tryRequire from '../../try_require'
import { Worker } from '../worker'
import { RuntimeOptions } from '../index'
import {
  WorkerToCoordinatorEvent,
  CoordinatorToWorkerCommand,
  InitializeCommand,
  RunCommand,
} from './types'

const { uuid } = IdGenerator

type IExitFunction = (exitCode: number, error?: Error, message?: string) => void
type IMessageSender = (command: WorkerToCoordinatorEvent) => void

export class ChildProcessWorker {
  private readonly cwd: string
  private readonly exit: IExitFunction

  private readonly id: string
  private readonly eventBroadcaster: EventEmitter
  private readonly newId: IdGenerator.NewId
  private readonly sendMessage: IMessageSender
  private options: RuntimeOptions
  private supportCodeLibrary: SupportCodeLibrary
  private worker: Worker

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
    this.eventBroadcaster.on('envelope', (envelope: Envelope) =>
      this.sendMessage({ type: 'ENVELOPE', envelope })
    )
  }

  async initialize({
    testRunStartedId,
    supportCodeCoordinates,
    supportCodeIds,
    options,
  }: InitializeCommand): Promise<void> {
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

    this.options = options
    this.worker = new Worker(
      testRunStartedId,
      this.id,
      this.eventBroadcaster,
      this.newId,
      this.options,
      this.supportCodeLibrary
    )
    await this.worker.runBeforeAllHooks()
    this.sendMessage({ type: 'READY' })
  }

  async finalize(): Promise<void> {
    await this.worker.runAfterAllHooks()
    this.exit(0)
  }

  async receiveMessage(command: CoordinatorToWorkerCommand): Promise<void> {
    switch (command.type) {
      case 'INITIALIZE':
        await this.initialize(command)
        break
      case 'RUN':
        await this.runTestCase(command)
        break
      case 'FINALIZE':
        await this.finalize()
        break
    }
  }

  async runTestCase(command: RunCommand): Promise<void> {
    const success = await this.worker.runTestCase(
      command.assembledTestCase,
      command.failing
    )
    this.sendMessage({
      type: 'FINISHED',
      success,
    })
  }
}
