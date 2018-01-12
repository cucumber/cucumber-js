import { formatLocation } from '../formatter/helpers'
import EventEmitter from 'events'
import readline from 'readline'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import TestCaseRunner from '../runtime/test_case_runner'
import UserCodeRunner from '../runtime/user_code_runner'
import VError from 'verror'

const EVENTS = [
  'test-case-prepared',
  'test-case-started',
  'test-step-started',
  'test-step-attachment',
  'test-step-finished',
  'test-case-finished'
]

export default class Slave {
  constructor({ stdin, stdout }) {
    this.initialized = false
    this.stdin = stdin
    this.stdout = stdout
    this.eventBroadcaster = new EventEmitter()
    EVENTS.forEach(event => {
      this.eventBroadcaster.on(event, data => this.write(event, data))
    })
  }

  initialize({ supportCodePaths, worldParameters }) {
    supportCodeLibraryBuilder.reset(this.cwd)
    supportCodePaths.forEach(codePath => require(codePath))
    this.supportCodeLibrary = supportCodeLibraryBuilder.finalize()
    this.worldParameters = worldParameters
  }

  async run() {
    this.rl = readline.createInterface({
      input: this.stdin,
      output: this.stdout,
      terminal: false
    })
    this.rl.on('line', async line => {
      const input = JSON.parse(line)
      if (this.initialized) {
        this.runTestCase(input)
      } else {
        this.initialize(input)
        await this.runTestRunHooks(
          'beforeTestRunHookDefinitions',
          'a BeforeAll'
        )
        this.rl.write('{"ready": true}')
        this.initialized = true
      }
    })
    this.rl.on('close', async () => {
      await Promise.all(this.runningTestCases)
      await this.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll')
      process.exit()
    })
  }

  async runTestCase({ testCase, skip }) {
    const testCaseRunner = new TestCaseRunner({
      eventBroadcaster: this.eventBroadcaster,
      skip,
      supportCodeLibrary: this.supportCodeLibrary,
      testCase,
      worldParameters: this.worldParameters
    })
    await testCaseRunner.run()
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
}
