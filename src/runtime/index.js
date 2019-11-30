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
  constructor({
    eventBroadcaster,
    eventDataCollector,
    options,
    pickleIds,
    supportCodeLibrary,
  }) {
    this.eventBroadcaster = eventBroadcaster
    this.eventDataCollector = eventDataCollector
    this.options = options || {}
    this.pickleIds = pickleIds || []
    this.stackTraceFilter = new StackTraceFilter()
    this.supportCodeLibrary = supportCodeLibrary
    this.success = true
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

  async runPickle(pickleId) {
    const pickle = this.eventDataCollector.pickleMap[pickleId]
    const retries = retriesForPickle(pickle, this.options)
    const skip = this.options.dryRun || (this.options.failFast && !this.success)
    const pickleRunner = new PickleRunner({
      eventBroadcaster: this.eventBroadcaster,
      gherkinDocument: this.eventDataCollector.gherkinDocumentMap[pickle.uri],
      pickle,
      retries,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      worldParameters: this.options.worldParameters,
    })
    const testResult = await pickleRunner.run()
    if (this.shouldCauseFailure(testResult.status)) {
      this.success = false
    }
  }

  async start() {
    if (this.options.filterStacktraces) {
      this.stackTraceFilter.filter()
    }
    this.eventBroadcaster.emit(new messages.Envelope({ testRunStarted: {} }))
    await this.runTestRunHooks('beforeTestRunHookDefinitions', 'a BeforeAll')
    await Promise.each(this.pickleIds, ::this.runPickle)
    await this.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll')
    this.eventBroadcaster.emit(
      'envelope',
      new messages.Envelope({
        testRunFinished: { success: this.success },
      })
    )
    if (this.options.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }
    return this.success
  }

  shouldCauseFailure(status) {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }
}
