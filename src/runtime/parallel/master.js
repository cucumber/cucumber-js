import _ from 'lodash'
import { fork } from 'child_process'
import commandTypes from './command_types'
import path from 'path'
import Status from '../../status'
import { retriesForPickle } from '../helpers'
import { messages } from 'cucumber-messages'

const slaveCommand = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'bin',
  'run_slave'
)

export default class Master {
  // options - {dryRun, failFast, filterStacktraces, retry, retryTagFilter, strict}
  constructor({
    cwd,
    eventBroadcaster,
    eventDataCollector,
    pickleIds,
    options,
    supportCodeLibrary,
    supportCodePaths,
    supportCodeRequiredModules,
  }) {
    this.cwd = cwd
    this.eventBroadcaster = eventBroadcaster
    this.eventDataCollector = eventDataCollector
    this.options = options || {}
    this.supportCodeLibrary = supportCodeLibrary
    this.supportCodePaths = supportCodePaths
    this.supportCodeRequiredModules = supportCodeRequiredModules
    this.pickleIds = pickleIds || []
    this.nextPickleIdIndex = 0
    this.success = true
    this.slaves = {}
    this.supportCodeIdMap = {}
  }

  parseSlaveMessage(slave, message) {
    let envelope
    switch (message.command) {
      case commandTypes.SUPPORT_CODE_IDS:
        this.saveDefinitionIdMapping(message)
        break
      case commandTypes.READY:
        this.giveSlaveWork(slave)
        break
      case commandTypes.ENVELOPE:
        envelope = messages.Envelope.decode(message.encodedEnvelope.data)
        this.eventBroadcaster.emit('envelope', envelope)
        if (envelope.testCase) {
          this.remapDefinitionIds(envelope.testCase)
        }
        if (envelope.testCaseFinished) {
          this.parseTestCaseResult(envelope.testCaseFinished.testResult)
        }
        break
      default:
        throw new Error(`Unexpected message from slave: ${message}`)
    }
  }

  saveDefinitionIdMapping(message) {
    _.each(message.stepDefinitionIds, (id, index) => {
      this.supportCodeIdMap[id] = this.supportCodeLibrary.stepDefinitions[
        index
      ].id
    })
    _.each(message.beforeTestCaseHookDefinitionIds, (id, index) => {
      this.supportCodeIdMap[
        id
      ] = this.supportCodeLibrary.beforeTestCaseHookDefinitions[index].id
    })
    _.each(message.afterTestCaseHookDefinitionIds, (id, index) => {
      this.supportCodeIdMap[
        id
      ] = this.supportCodeLibrary.afterTestCaseHookDefinitions[index].id
    })
  }

  remapDefinitionIds(testCase) {
    for (const testStep of testCase.testSteps) {
      if (testStep.hookId) {
        testStep.hookId = this.supportCodeIdMap[testStep.hookId]
      }
      if (testStep.stepDefinitionIds) {
        testStep.stepDefinitionIds = testStep.stepDefinitionIds.map(
          id => this.supportCodeIdMap[id]
        )
      }
    }
  }

  startSlave(id, total) {
    const slaveProcess = fork(slaveCommand, [], {
      cwd: this.cwd,
      env: _.assign({}, process.env, {
        CUCUMBER_PARALLEL: 'true',
        CUCUMBER_TOTAL_SLAVES: total,
        CUCUMBER_SLAVE_ID: id,
      }),
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    })
    const slave = { process: slaveProcess }
    this.slaves[id] = slave
    slave.process.on('message', message => {
      this.parseSlaveMessage(slave, message)
    })
    slave.process.on('close', error => {
      slave.closed = true
      this.onSlaveClose(error)
    })
    slave.process.send({
      command: commandTypes.INITIALIZE,
      filterStacktraces: this.options.filterStacktraces,
      supportCodePaths: this.supportCodePaths,
      supportCodeRequiredModules: this.supportCodeRequiredModules,
      worldParameters: this.options.worldParameters,
    })
  }

  onSlaveClose(error) {
    if (error) {
      this.result.success = false
    }
    if (_.every(this.slaves, 'closed')) {
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testRunFinished: { success: this.success },
        })
      )
      this.onFinish(this.success)
    }
  }

  parseTestCaseResult(testCaseResult) {
    if (
      !testCaseResult.willBeRetried &&
      this.shouldCauseFailure(testCaseResult.status)
    ) {
      this.success = false
    }
  }

  run(numberOfSlaves, done) {
    this.eventBroadcaster.emit('test-run-started')
    _.times(numberOfSlaves, id => this.startSlave(id, numberOfSlaves))
    this.onFinish = done
  }

  giveSlaveWork(slave) {
    if (this.nextPickleIdIndex === this.pickleIds.length) {
      slave.process.send({ command: commandTypes.FINALIZE })
      return
    }
    const pickleId = this.pickleIds[this.nextPickleIdIndex]
    this.nextPickleIdIndex += 1
    const pickle = this.eventDataCollector.pickleMap[pickleId]
    const gherkinDocument = this.eventDataCollector.gherkinDocumentMap[
      pickle.uri
    ]
    const retries = retriesForPickle(pickle, this.options)
    const skip =
      this.options.dryRun || (this.options.failFast && !this.result.success)
    slave.process.send({
      command: commandTypes.RUN,
      retries,
      skip,
      pickle,
      gherkinDocument,
    })
  }

  shouldCauseFailure(status) {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }
}
