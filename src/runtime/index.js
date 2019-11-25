import _ from 'lodash'
import { formatLocation } from '../formatter/helpers'
import Promise from 'bluebird'
import StackTraceFilter from '../stack_trace_filter'
import UserCodeRunner from '../user_code_runner'
import VError from 'verror'
import { retriesForPickle } from './helpers'
import { messages } from 'cucumber-messages'
import PickleRunner from './pickle_runner'

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

  async runPickle(pickle) {
    const retries = retriesForPickle(pickle, this.options)
    const skip =
      this.options.dryRun || (this.options.failFast && !this.result.success)
    const pickleRunner = new PickleRunner({
      eventBroadcaster: this.eventBroadcaster,
      pickle,
      retries,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.options.worldParameters,
    })
    const testResult = await pickleRunner.run()
    if (testResult.duration) {
      this.result.duration += testResult.duration
    }
    if (this.shouldCauseFailure(testResult.status)) {
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
    this.eventBroadcaster.emit('envelope', { testRunFinished: this.result })
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
