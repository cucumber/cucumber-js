import _ from 'lodash'
import Status from '../status'
import childProcess from 'child_process'
import path from 'path'
import readline from 'readline'

const slaveCommand = path.resolve(__dirname, '..', '..', 'bin', 'slave.js')

export default class Master {
  // options - {dryRun, failFast, filterStacktraces, strict}
  constructor({
    eventBroadcaster,
    options,
    supportCodePaths,
    supportCodeRequiredModules,
    testCases,
    numberOfSlaves,
    onFinish
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
      success: true
    }
    this.numberOfSlaves = numberOfSlaves
    this.slaves = {}
    this.onFinish = onFinish
  }

  startSlave(id) {
    const slaveProcess = childProcess.spawn(slaveCommand, [], {
      env: _.assign({}, process.env, { CUCUMBER_SLAVE_ID: id }),
      stdio: ['pipe', 'pipe', process.stderr]
    })
    const rl = readline.createInterface({ input: slaveProcess.stdout })
    const slave = { id, process: slaveProcess, status: 'initializing' }
    this.slaves[id] = slave
    rl.on('line', line => {
      // console.log(`Received line from slave ${id}: ${line}`)
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
    slave.process.stdin.write(
      JSON.stringify({
        filterStacktraces: this.options.filterStacktraces,
        supportCodePaths: this.supportCodePaths,
        supportCodeRequiredModules: this.supportCodeRequiredModules,
        worldParameters: this.options.worldParameters
      }) + '\n'
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

  run() {
    this.eventBroadcaster.emit('test-run-started')
    _.times(this.numberOfSlaves, id => this.startSlave(id))
  }

  disperseWork() {
    // console.log(`dispersing work`)
    if (this.testCasesCompleted === this.testCases.length) {
      this.eventBroadcaster.emit('test-run-finished', { result: this.result })
      _.each(this.slaves, slave => slave.process.kill())
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
    // console.log(`dispersing work to slave ${slave.id}`)
    slave.status = 'running'
    slave.process.stdin.write(JSON.stringify({ skip, testCase }) + '\n')
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
