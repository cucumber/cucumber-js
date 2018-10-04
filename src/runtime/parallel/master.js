import _ from 'lodash'
import crossSpawn from 'cross-spawn'
import commandTypes from './command_types'
import path from 'path'
import Status from '../../status'

const slaveCommand = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'bin',
  'run_slave'
)

export default class Master {
  // options - {dryRun, failFast, filterStacktraces, strict}
  constructor({
    eventBroadcaster,
    options,
    supportCodePaths,
    supportCodeRequiredModules,
    testCases,
  }) {
    this.eventBroadcaster = eventBroadcaster
    this.options = options || {}
    this.supportCodePaths = supportCodePaths
    this.supportCodeRequiredModules = supportCodeRequiredModules
    this.testCases = testCases || []
    this.nextTestCaseIndex = 0
    this.testCasesCompleted = 0
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
    const slaveProcess = crossSpawn(slaveCommand, [], {
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
    slave.process.on('close', () => {
      slave.closed = true
      this.onSlaveClose()
    })
    slave.process.send({
      command: commandTypes.INITIALIZE,
      filterStacktraces: this.options.filterStacktraces,
      supportCodePaths: this.supportCodePaths,
      supportCodeRequiredModules: this.supportCodeRequiredModules,
      worldParameters: this.options.worldParameters,
    })
  }

  onSlaveClose() {
    if (_.every(this.slaves, 'closed')) {
      this.eventBroadcaster.emit('test-run-finished', { result: this.result })
      this.onFinish(this.result.success)
    }
  }

  parseTestCaseResult(testCaseResult) {
    this.testCasesCompleted += 1
    if (testCaseResult.duration) {
      this.result.duration += testCaseResult.duration
    }
    if (this.shouldCauseFailure(testCaseResult.status)) {
      this.result.success = false
    }
  }

  run(numberOfSlaves, done) {
    this.eventBroadcaster.emit('test-run-started')
    _.times(numberOfSlaves, id => this.startSlave(id, numberOfSlaves))
    this.onFinish = done
  }

  giveSlaveWork(slave) {
    if (this.nextTestCaseIndex === this.testCases.length) {
      slave.process.send({ command: commandTypes.FINALIZE })
      return
    }
    const testCase = this.testCases[this.nextTestCaseIndex]
    this.nextTestCaseIndex += 1
    const skip =
      this.options.dryRun || (this.options.failFast && !this.result.success)
    slave.process.send({ command: commandTypes.RUN, skip, testCase })
  }

  shouldCauseFailure(status) {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }
}
