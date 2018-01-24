import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestCaseRunner from './test_case_runner'
import Status from '../status'
import StepRunner from './step_runner'
import { EventEmitter } from 'events'

describe('TestCaseRunner', function() {
  beforeEach(function() {
    this.onTestCasePrepared = sinon.stub()
    this.onTestCaseStarted = sinon.stub()
    this.onTestStepStarted = sinon.stub()
    this.onTestStepFinished = sinon.stub()
    this.onTestCaseFinished = sinon.stub()
    this.eventBroadcaster = new EventEmitter()
    this.eventBroadcaster.on('test-case-prepared', this.onTestCasePrepared)
    this.eventBroadcaster.on('test-case-started', this.onTestCaseStarted)
    this.eventBroadcaster.on('test-step-started', this.onTestStepStarted)
    this.eventBroadcaster.on('test-step-finished', this.onTestStepFinished)
    this.eventBroadcaster.on('test-case-finished', this.onTestCaseFinished)
    this.testCase = {
      pickle: {
        steps: [],
        locations: [{ line: 1 }]
      },
      uri: 'path/to/feature'
    }
    this.supportCodeLibrary = {
      afterTestCaseHookDefinitions: [],
      beforeTestCaseHookDefinitions: [],
      defaultTimeout: 5000,
      stepDefinitions: [],
      parameterTypeRegistry: {},
      World() {}
    }
    sinon.stub(StepRunner, 'run')
  })

  afterEach(function() {
    StepRunner.run.restore()
  })

  describe('run()', function() {
    describe('with no steps or hooks', function() {
      beforeEach(async function() {
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.been.calledOnce
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [],
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.been.calledOnce
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.been.calledOnce
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.PASSED },
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })
    })

    describe('with a passing step', function() {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        this.stepResult = {
          duration: 1,
          status: Status.PASSED
        }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true)
        }
        StepRunner.run.resolves(this.stepResult)
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.been.calledOnce
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' }
            }
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.been.calledOnce
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.been.calledOnce
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.been.calledOnce
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: { duration: 1, status: Status.PASSED }
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.been.calledOnce
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 1, status: Status.PASSED },
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })
    })

    describe('with a failing step', function() {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        this.error = new Error('a')
        this.stepResult = {
          duration: 1,
          status: Status.FAILED,
          exception: this.error
        }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true)
        }
        StepRunner.run.resolves(this.stepResult)
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.been.calledOnce
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' }
            }
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.been.calledOnce
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.been.calledOnce
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.been.calledOnce
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: {
            duration: 1,
            status: Status.FAILED,
            exception: this.error
          }
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.been.calledOnce
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: {
            duration: 1,
            status: Status.FAILED,
            exception: this.error
          },
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })
    })

    describe('with an ambiguous step', function() {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        const stepDefinition1 = {
          pattern: 'pattern1',
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true)
        }
        const stepDefinition2 = {
          pattern: 'pattern2',
          uri: 'path/to/steps',
          line: 4,
          matchesStepName: sinon.stub().returns(true)
        }
        this.supportCodeLibrary.stepDefinitions = [
          stepDefinition1,
          stepDefinition2
        ]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.been.calledOnce
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              sourceLocation: { line: 2, uri: 'path/to/feature' }
            }
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.been.calledOnce
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.been.calledOnce
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.been.calledOnce
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: {
            exception:
              'Multiple step definitions match:\n' +
              '  pattern1 - path/to/steps:3\n' +
              '  pattern2 - path/to/steps:4',
            status: Status.AMBIGUOUS
          }
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.been.calledOnce
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: {
            duration: 0,
            status: Status.AMBIGUOUS,
            exception:
              'Multiple step definitions match:\n' +
              '  pattern1 - path/to/steps:3\n' +
              '  pattern2 - path/to/steps:4'
          },
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })
    })

    describe('with an undefined step', function() {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.been.calledOnce
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [{ sourceLocation: { line: 2, uri: 'path/to/feature' } }],
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.been.calledOnce
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.been.calledOnce
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.been.calledOnce
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: { status: Status.UNDEFINED }
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.been.calledOnce
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.UNDEFINED },
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })
    })

    describe('with a step when skipping', function() {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true)
        }
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.been.calledOnce
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' }
            }
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.been.calledOnce
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.been.calledOnce
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.been.calledOnce
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: { status: Status.SKIPPED }
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.been.calledOnce
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.SKIPPED },
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })
    })

    describe('with a before hook and step when skipping', function() {
      beforeEach(async function() {
        const testCaseHookDefinition = new TestCaseHookDefinition({
          code() {
            throw new Error('error')
          },
          line: 4,
          options: {},
          uri: 'path/to/hooks'
        })
        this.supportCodeLibrary.beforeTestCaseHookDefinitions = [
          testCaseHookDefinition
        ]
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true)
        }
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.been.calledOnce
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            { actionLocation: { line: 4, uri: 'path/to/hooks' } },
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' }
            }
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.been.calledOnce
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.been.calledTwice
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 1,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.been.calledTwice
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: { status: Status.SKIPPED }
        })
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 1,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: { status: Status.SKIPPED }
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.been.calledOnce
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.SKIPPED },
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })
    })

    describe('with an after hook when skipping', function() {
      beforeEach(async function() {
        const testCaseHookDefinition = new TestCaseHookDefinition({
          code() {
            throw new Error('error')
          },
          line: 4,
          options: {},
          uri: 'path/to/hooks'
        })
        this.supportCodeLibrary.afterTestCaseHookDefinitions = [
          testCaseHookDefinition
        ]
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true)
        }
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.been.calledOnce
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' }
            },
            { actionLocation: { line: 4, uri: 'path/to/hooks' } }
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.been.calledOnce
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.been.calledTwice
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 1,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } }
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.been.calledTwice
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: { status: Status.SKIPPED }
        })
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 1,
          testCase: { sourceLocation: { line: 1, uri: 'path/to/feature' } },
          result: { status: Status.SKIPPED }
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.been.calledOnce
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.SKIPPED },
          sourceLocation: { line: 1, uri: 'path/to/feature' }
        })
      })
    })
  })
})
