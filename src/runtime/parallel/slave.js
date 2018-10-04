import _ from 'lodash'
import { formatLocation } from '../../formatter/helpers'
import commandTypes from './command_types'
import EventEmitter from 'events'
import Promise from 'bluebird'
import serializeError from 'serialize-error'
import StackTraceFilter from '../stack_trace_filter'
import supportCodeLibraryBuilder from '../../support_code_library_builder'
import TestCaseRunner from '../test_case_runner'
import UserCodeRunner from '../../user_code_runner'
import VError from 'verror'

const EVENTS = [
  'test-case-prepared',
  'test-case-started',
  'test-step-started',
  'test-step-attachment',
  'test-step-finished',
  'test-case-finished',
]

function serializeResultExceptionIfNecessary(data) {
  if (
    data.result &&
    data.result.exception &&
    _.isError(data.result.exception)
  ) {
    data.result.exception = serializeError(data.result.exception)
  }
}

export default class Slave {
  constructor({ cwd, exit, sendMessage }) {
    this.initialized = false
    this.cwd = cwd
    this.exit = exit
    this.sendMessage = sendMessage
    this.eventBroadcaster = new EventEmitter()
    this.stackTraceFilter = new StackTraceFilter()
    EVENTS.forEach(name => {
      this.eventBroadcaster.on(name, data => {
        serializeResultExceptionIfNecessary(data)
        this.sendMessage({ command: commandTypes.EVENT, name, data })
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

  async runTestCase({ testCase, skip }) {
    const testCaseRunner = new TestCaseRunner({
      eventBroadcaster: this.eventBroadcaster,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      testCase,
      worldParameters: this.worldParameters,
    })
    await testCaseRunner.run()
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
        throw new VError(
          error,
          `${name} hook errored, process exiting: ${location}`
        )
      }
    })
  }
}
