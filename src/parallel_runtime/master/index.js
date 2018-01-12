import _ from 'lodash'
import Status from '../status'
import childProcess from 'child_process'
import path from 'path'
import readline from 'readline'

const slaveCommand = path.join(__dirname, 'slave', 'cli.js')

export default class Master {
  // options - {dryRun, failFast, filterStacktraces, strict}
  constructor({
    eventBroadcaster,
    options,
    supportCodePaths,
    testCases,
    numberOfSlaves,
    onFinished
  }) {
    this.eventBroadcaster = eventBroadcaster
    this.options = options || {}
    this.supportCodePaths = supportCodePaths
    this.testCases = testCases || []
    this.nextTestCaseIndex = 0
    this.testCasesCompleted = 0
    this.result = {
      duration: 0,
      success: true
    }
    this.numberOfSlaves = numberOfSlaves
    this.slaves = {}
    this.onFinished = onFinished
  }

  startSlave(id) {
    const slaveProcess = childProcess.spawn(slaveCommand, [], {})
    const rl = readline.createInterface({
      input: slaveProcess.stdin,
      output: slaveProcess.stdout
    })
    const slave = { process: slaveProcess, rl }
    this.slaves[id] = slave
    rl.on('line', line => {
      const input = JSON.parse(line)
      if (slave.status === 'initializing' && input.ready) {
        slave.status = 'ready'
        this.disperseWork()
      }
      if (slave.status === 'running') {
        this.eventBroadcaster.emit(input.type, input.data)
        if (input.type === 'test-case-finished') {
          this.parseTestCaseResult(input.data)
          slave.status = 'ready'
          this.disperseWork()
        }
      }
    })
    rl.write(
      JSON.stringify({
        supportCodePaths: this.supportCodePaths,
        worldParameters: this.worldParameters
      })
    )
  }

  parseTestCaseResult({ result }) {
    this.testCasesCompleted += 1
    if (result.duration) {
      this.result.duration += result.duration
    }
    if (this.shouldCauseFailure(result.status)) {
      this.result.success = false
    }
  }

  start() {
    this.eventBroadcaster.emit('test-run-started')
    _.times(this.numberOfSlaves, id => this.startSlave(id))
  }

  disperseWork() {
    if (this.testCasesCompleted === this.testCases.length) {
      this.eventBroadcaster.emit('test-run-finished', { result: this.result })
      this.onFinish(this.result.success)
      return
    } else if (this.nextTestCaseIndex === this.testCases.length) {
      return // no more work to disperse
    }
    const testCase = this.testCases[this.nextTestCaseIndex]
    this.nextTestCaseIndex += 1
    const skip =
      this.options.dryRun || (this.options.failFast && !this.result.success)
    const slave = this.getFreeSlave()
    slave.rl.write(JSON.stringify({ skip, testCase }))
  }

  shouldCauseFailure(status) {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }

  getFreeSlave() {
    return _.find(this.slaves, ['status', 'ready'])
  }
}
