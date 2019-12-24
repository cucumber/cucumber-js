import { formatLocation } from '../../formatter/helpers'
import {
  IMasterReport,
  ISlaveCommand,
  ISlaveCommandInitialize,
  ISlaveCommandRun,
} from './command_types'
import EventEmitter from 'events'
import bluebird from 'bluebird'
import StackTraceFilter from '../../stack_trace_filter'
import supportCodeLibraryBuilder from '../../support_code_library_builder'
import PickleRunner from '../pickle_runner'
import UserCodeRunner from '../../user_code_runner'
import { messages, IdGenerator } from 'cucumber-messages'
import TestRunHookDefinition from '../../models/test_run_hook_definition'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesHaveValue, valueOrDefault } from '../../value_checker'

const { uuid } = IdGenerator

export default class Slave {
  private readonly cwd: string
  private readonly exit: (
    exitCode: number,
    error?: Error,
    message?: string
  ) => void

  private readonly id: string
  private readonly eventBroadcaster: EventEmitter
  private filterStacktraces: boolean
  private readonly newId: IdGenerator.NewId
  private readonly sendMessage: (command: IMasterReport) => void
  private readonly stackTraceFilter: StackTraceFilter
  private supportCodeLibrary: ISupportCodeLibrary
  private worldParameters: any

  constructor({ cwd, exit, id, sendMessage }) {
    this.id = id
    this.newId = uuid()
    this.cwd = cwd
    this.exit = exit
    this.sendMessage = sendMessage
    this.eventBroadcaster = new EventEmitter()
    this.stackTraceFilter = new StackTraceFilter()
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      this.sendMessage({
        jsonEnvelope: JSON.stringify(envelope.toJSON()),
      })
    })
  }

  async initialize({
    filterStacktraces,
    supportCodeRequiredModules,
    supportCodePaths,
    worldParameters,
  }: ISlaveCommandInitialize): Promise<void> {
    supportCodeRequiredModules.map(module => require(module))
    supportCodeLibraryBuilder.reset(this.cwd, this.newId)
    supportCodePaths.forEach(codePath => require(codePath))
    this.supportCodeLibrary = supportCodeLibraryBuilder.finalize()
    this.sendMessage({
      supportCodeIds: {
        stepDefinitionIds: this.supportCodeLibrary.stepDefinitions.map(
          s => s.id
        ),
        beforeTestCaseHookDefinitionIds: this.supportCodeLibrary.beforeTestCaseHookDefinitions.map(
          h => h.id
        ),
        afterTestCaseHookDefinitionIds: this.supportCodeLibrary.afterTestCaseHookDefinitions.map(
          h => h.id
        ),
      },
    })
    this.worldParameters = worldParameters
    this.filterStacktraces = filterStacktraces
    if (this.filterStacktraces) {
      this.stackTraceFilter.filter()
    }
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

  async receiveMessage(message: ISlaveCommand): Promise<void> {
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
    retries,
    skip,
  }: ISlaveCommandRun): Promise<void> {
    const pickleRunner = new PickleRunner({
      eventBroadcaster: this.eventBroadcaster,
      gherkinDocument,
      newId: this.newId,
      pickle,
      retries,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.worldParameters,
    })
    await pickleRunner.run()
    this.sendMessage({ ready: true })
  }

  async runTestRunHooks(
    testRunHookDefinitions: TestRunHookDefinition[],
    name: string
  ): Promise<void> {
    await bluebird.each(testRunHookDefinitions, async hookDefinition => {
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
        this.exit(
          1,
          error,
          `${name} hook errored on slave ${this.id}, process exiting: ${location}`
        )
      }
    })
  }
}
