import _ from 'lodash'
import { formatLocation } from '../formatter/helpers'
import Promise from 'bluebird'
import StackTraceFilter from '../stack_trace_filter'
import TestCaseRunner from './pickle_runner'
import UserCodeRunner from '../user_code_runner'
import VError from 'verror'
import { retriesForPickle } from './helpers'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult

export default class Runtime {
  // options - {dryRun, failFast, filterStacktraces, retry, retryTagFilter, strict}
  constructor({ eventBroadcaster, options, supportCodeLibrary, pickles }) {
    this.eventBroadcaster = eventBroadcaster
    this.options = options || {}
    this.stackTraceFilter = new StackTraceFilter()
    this.supportCodeLibrary = supportCodeLibrary
    this.pickles = pickles || []
    this.result = {
      duration: 0,
      success: true,
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

  async runPickle(testCase) {
    const retries = retriesForPickle(testCase, this.options)
    const skip =
      this.options.dryRun || (this.options.failFast && !this.result.success)
    const testCaseRunner = new TestCaseRunner({
      eventBroadcaster: this.eventBroadcaster,
      retries,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      testCase,
      worldParameters: this.options.worldParameters,
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
    this.eventBroadcaster.emit(new messages.Envelope({ testRunStarted: {} }))
    await this.runTestRunHooks('beforeTestRunHookDefinitions', 'a BeforeAll')
    await Promise.each(this.pickles, ::this.runPickle)
    await this.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll')
    // TODO custom envelope need to update cucumber-messages
    this.eventBroadcaster.emit({ testRunFinished: this.result })
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
