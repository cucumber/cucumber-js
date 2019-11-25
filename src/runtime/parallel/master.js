import _ from 'lodash'
import { fork } from 'child_process'
import commandTypes from './command_types'
import path from 'path'
import { retriesForPickle } from '../helpers'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult

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
    options,
    supportCodePaths,
    supportCodeRequiredModules,
    pickles,
  }) {
    this.cwd = cwd
    this.eventBroadcaster = eventBroadcaster
    this.options = options || {}
    this.supportCodePaths = supportCodePaths
    this.supportCodeRequiredModules = supportCodeRequiredModules
    this.pickles = pickles || []
    this.nextPickleIndex = 0
    this.result = {
      duration: 0,
      success: true,
    }
    this.slaves = {}
  }

  parseSlaveMessage(slave, message) {
    switch (message.command) {
      case commandTypes.READY:
        this.giveSlaveWork(slave)
        break
      case commandTypes.EVENT:
        this.eventBroadcaster.emit(message.name, message.data)
        if (message.name === 'test-case-finished') {
          this.parseTestCaseResult(message.data.result)
        }
        break
      default:
        throw new Error(`Unexpected message from slave: ${message}`)
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
      this.eventBroadcaster.emit('test-run-finished', { result: this.result })
      this.onFinish(this.result.success)
    }
  }

  parseTestCaseResult(testCaseResult) {
    if (testCaseResult.duration) {
      this.result.duration += testCaseResult.duration
    }
    if (
      !testCaseResult.retried &&
      this.shouldCauseFailure(testCaseResult.status)
    ) {
      this.result.success = false
    }
  }

  run(numberOfSlaves, done) {
    this.eventBroadcaster.emit('test-run-started')
    _.times(numberOfSlaves, id => this.startSlave(id, numberOfSlaves))
    this.onFinish = done
  }

  giveSlaveWork(slave) {
    if (this.nextPickleIndex === this.pickles.length) {
      slave.process.send({ command: commandTypes.FINALIZE })
      return
    }
    const pickle = this.pickles[this.nextPickleIndex]
    this.nextPickleIndex += 1
    const retries = retriesForPickle(pickle, this.options)
    const skip =
      this.options.dryRun || (this.options.failFast && !this.result.success)
    slave.process.send({ command: commandTypes.RUN, retries, skip, pickle })
  }

  shouldCauseFailure(status) {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }
}
