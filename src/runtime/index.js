import _ from 'lodash'
import { formatLocation } from '../formatter/helpers'
import Promise from 'bluebird'
import StackTraceFilter from './stack_trace_filter'
import Status from '../status'
import TestCaseRunner from './test_case_runner'
import UserCodeRunner from '../user_code_runner'
import VError from 'verror'

export default class Runtime {
  // options - {dryRun, failFast, filterStacktraces, strict}
  constructor({ eventBroadcaster, options, supportCodeLibrary, testCases }) {
    this.eventBroadcaster = eventBroadcaster
    this.options = options || {}
    this.stackTraceFilter = new StackTraceFilter()
    this.supportCodeLibrary = supportCodeLibrary
    this.testCases = testCases || []
    this.result = {
      duration: 0,
      success: true
    }
  }

  async runTestRunHooks(key, name) {
    await Promise.each(this.supportCodeLibrary[key], async hookDefinition => {
      const { error } = await UserCodeRunner.run({
        argsArray: [],
        fn: hookDefinition.code,
        thisArg: null,
        timeoutInMilliseconds:
          hookDefinition.options.timeout ||
          this.supportCodeLibrary.defaultTimeout
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

  async runTestCase(testCase) {
    const skip =
      this.options.dryRun || (this.options.failFast && !this.result.success)
    const testCaseRunner = new TestCaseRunner({
      eventBroadcaster: this.eventBroadcaster,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      testCase,
      worldParameters: this.options.worldParameters
    })
    const testCaseResult = await testCaseRunner.run()
    if (testCaseResult.duration) {
      this.result.duration += testCaseResult.duration
    }
    if (this.shouldCauseFailure(testCaseResult.status)) {
      this.result.success = false
    }
  }

  async start() {
    if (this.options.filterStacktraces) {
      this.stackTraceFilter.filter()
    }
    this.eventBroadcaster.emit('test-run-started')
    await this.runTestRunHooks('beforeTestRunHookDefinitions', 'a BeforeAll')
    await Promise.each(this.testCases, ::this.runTestCase)
    await this.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll')
    this.eventBroadcaster.emit('test-run-finished', { result: this.result })
    if (this.options.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }
    return this.result.success
  }

  shouldCauseFailure(status) {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }
}
