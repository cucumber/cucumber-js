import _ from 'lodash'
import { formatLocation } from '../../formatter/helpers'
import commandTypes from './command_types'
import EventEmitter from 'events'
import Promise from 'bluebird'
import readline from 'readline'
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

function replacerSerializeErrors(key, value) {
  if (_.isError(value)) {
    return serializeError(value)
  }
  return value
}

export default class Slave {
  constructor({ cwd, stdin, stdout }) {
    this.initialized = false
    this.stdin = stdin
    this.stdout = stdout
    this.cwd = cwd
    this.eventBroadcaster = new EventEmitter()
    this.stackTraceFilter = new StackTraceFilter()
    EVENTS.forEach(name => {
      this.eventBroadcaster.on(name, data =>
        this.stdout.write(
          JSON.stringify(
            { command: commandTypes.EVENT, name, data },
            replacerSerializeErrors
          ) + '\n'
        )
      )
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
    this.stdout.write(JSON.stringify({ command: commandTypes.READY }) + '\n')
  }

  async finalize() {
    await this.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll')
    if (this.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }
    process.exit()
  }

  parseMasterLine(line) {
    const input = JSON.parse(line)
    if (input.command === 'initialize') {
      this.initialize(input)
    } else if (input.command === 'finalize') {
      this.finalize()
    } else if (input.command === 'run') {
      this.runTestCase(input)
    }
  }

  async run() {
    this.rl = readline.createInterface({ input: this.stdin })
    this.rl.on('line', line => {
      this.parseMasterLine(line)
    })
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
    this.stdout.write(JSON.stringify({ command: commandTypes.READY }) + '\n')
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
