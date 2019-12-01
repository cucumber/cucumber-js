import { formatLocation } from '../../formatter/helpers'
import commandTypes from './command_types'
import EventEmitter from 'events'
import Promise from 'bluebird'
import StackTraceFilter from '../../stack_trace_filter'
import supportCodeLibraryBuilder from '../../support_code_library_builder'
import PickleRunner from '../pickle_runner'
import UserCodeRunner from '../../user_code_runner'
import VError from 'verror'
import { messages } from 'cucumber-messages'

export default class Slave {
  constructor({ cwd, exit, id, sendMessage }) {
    this.id = id
    this.initialized = false
    this.cwd = cwd
    this.exit = exit
    this.sendMessage = sendMessage
    this.eventBroadcaster = new EventEmitter()
    this.stackTraceFilter = new StackTraceFilter()
    this.eventBroadcaster.on('envelope', envelope => {
      this.sendMessage({
        command: commandTypes.ENVELOPE,
        encodedEnvelope: messages.Envelope.encode(envelope).finish(),
      })
    })
  }

  async initialize({
    filterStacktraces,
    supportCodeRequiredModules,
    supportCodePaths,
    worldParameters,
  }) {
    supportCodeRequiredModules.map(module => require(module))
    supportCodeLibraryBuilder.reset(this.cwd)
    supportCodePaths.forEach(codePath => require(codePath))
    this.supportCodeLibrary = supportCodeLibraryBuilder.finalize()
    this.sendMessage({
      command: commandTypes.SUPPORT_CODE_IDS,
      stepDefinitionIds: this.supportCodeLibrary.stepDefinitions.map(s => s.id),
      beforeTestCaseHookDefinitionIds: this.supportCodeLibrary.beforeTestCaseHookDefinitions.map(
        h => h.id
      ),
      afterTestCaseHookDefinitionIds: this.supportCodeLibrary.afterTestCaseHookDefinitions.map(
        h => h.id
      ),
    })
    this.worldParameters = worldParameters
    this.filterStacktraces = filterStacktraces
    if (this.filterStacktraces) {
      this.stackTraceFilter.filter()
    }
    await this.runTestRunHooks('beforeTestRunHookDefinitions', 'a BeforeAll')
    this.sendMessage({ command: commandTypes.READY })
  }

  async finalize() {
    await this.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll')
    if (this.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }
    this.exit()
  }

  receiveMessage(message) {
    if (message.command === 'initialize') {
      this.initialize(message)
    } else if (message.command === 'finalize') {
      this.finalize()
    } else if (message.command === 'run') {
      this.runTestCase(message)
    }
  }

  async runTestCase({ gherkinDocument, pickle, retries, skip }) {
    const pickleRunner = new PickleRunner({
      eventBroadcaster: this.eventBroadcaster,
      gherkinDocument,
      pickle,
      retries,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.worldParameters,
    })
    await pickleRunner.run()
    this.sendMessage({ command: commandTypes.READY })
  }

  async runTestRunHooks(key, name) {
    await Promise.each(this.supportCodeLibrary[key], async hookDefinition => {
      const { error } = await UserCodeRunner.run({
        argsArray: [],
        fn: hookDefinition.code,
        thisArg: null,
        timeoutInMilliseconds:
          hookDefinition.options.timeout ||
          this.supportCodeLibrary.defaultTimeout,
      })
      if (error) {
        const location = formatLocation(hookDefinition)
        console.error(
          VError.fullStack(
            new VError(
              error,
              `${name} hook errored on slave ${this.id}, process exiting: ${location}`
            )
          )
        ) // eslint-disable-line no-console
        this.exit(1)
      }
    })
  }
}
