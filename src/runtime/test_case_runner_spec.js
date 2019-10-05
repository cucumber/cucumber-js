import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestCaseRunner from './test_case_runner'
import Status from '../status'
import StepRunner from './step_runner'
import { EventEmitter } from 'events'

describe('TestCaseRunner', () => {
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
        locations: [{ line: 1 }],
      },
      uri: 'path/to/feature',
    }
    this.supportCodeLibrary = {
      afterTestCaseHookDefinitions: [],
      beforeTestCaseHookDefinitions: [],
      defaultTimeout: 5000,
      stepDefinitions: [],
      parameterTypeRegistry: {},
      World() {},
    }
    sinon.stub(StepRunner, 'run')
  })

  afterEach(() => {
    StepRunner.run.restore()
  })

  describe('run()', () => {
    describe('with no steps or hooks', () => {
      beforeEach(async function() {
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.callCount(1)
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.callCount(1)
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.PASSED },
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })
    })

    describe('with a passing step', () => {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        this.stepResult = {
          duration: 1,
          status: Status.PASSED,
        }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true),
        }
        StepRunner.run.resolves(this.stepResult)
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' },
            },
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.callCount(1)
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.callCount(1)
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.callCount(1)
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: { duration: 1, status: Status.PASSED },
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.callCount(1)
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 1, status: Status.PASSED },
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })
    })

    describe('with a failing step', () => {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        this.error = new Error('a')
        this.stepResult = {
          duration: 1,
          status: Status.FAILED,
          exception: this.error,
        }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true),
        }
        StepRunner.run.resolves(this.stepResult)
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' },
            },
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.callCount(1)
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.callCount(1)
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.callCount(1)
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: {
            duration: 1,
            status: Status.FAILED,
            exception: this.error,
          },
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.callCount(1)
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: {
            duration: 1,
            status: Status.FAILED,
            exception: this.error,
          },
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })
    })

    describe('with a flaky step and a positive retries value', () => {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        this.error = new Error('a')
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true),
        }
        StepRunner.run.onFirstCall().resolves({
          duration: 1,
          status: Status.FAILED,
          exception: this.error,
        })
        StepRunner.run.onSecondCall().resolves({
          duration: 1,
          status: Status.PASSED,
        })
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          retries: 1,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' },
            },
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started twice', function() {
        const sourceLocation = { line: 1, uri: 'path/to/feature' }
        expect(this.onTestCaseStarted).to.have.callCount(2)
        expect(this.onTestCaseStarted.firstCall).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation,
        })
        expect(this.onTestCaseStarted.secondCall).to.have.been.calledWith({
          attemptNumber: 2,
          sourceLocation,
        })
      })

      it('emits test-step-started twice', function() {
        expect(this.onTestStepStarted).to.have.callCount(2)
        expect(this.onTestStepStarted.firstCall).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
        expect(this.onTestStepStarted.secondCall).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 2,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
      })

      it('emits test-step-finished twice', function() {
        expect(this.onTestStepFinished).to.have.callCount(2)
        expect(this.onTestStepFinished.firstCall).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: {
            duration: 1,
            status: Status.FAILED,
            exception: this.error,
          },
        })
        expect(this.onTestStepFinished.secondCall).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 2,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: {
            duration: 1,
            status: Status.PASSED,
          },
        })
      })

      it('emits test-case-finished twice', function() {
        const sourceLocation = { line: 1, uri: 'path/to/feature' }
        expect(this.onTestCaseFinished).to.have.callCount(2)
        expect(this.onTestCaseFinished.firstCall).to.have.been.calledWith({
          result: {
            duration: 1,
            exception: this.error,
            retried: true,
            status: Status.FAILED,
          },
          attemptNumber: 1,
          sourceLocation,
        })
        expect(this.onTestCaseFinished.secondCall).to.have.been.calledWith({
          result: {
            duration: 1,
            status: Status.PASSED,
          },
          attemptNumber: 2,
          sourceLocation,
        })
      })
    })

    describe('with an ambiguous step', () => {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        const stepDefinition1 = {
          pattern: 'pattern1',
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true),
        }
        const stepDefinition2 = {
          pattern: 'pattern2',
          uri: 'path/to/steps',
          line: 4,
          matchesStepName: sinon.stub().returns(true),
        }
        this.supportCodeLibrary.stepDefinitions = [
          stepDefinition1,
          stepDefinition2,
        ]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              sourceLocation: { line: 2, uri: 'path/to/feature' },
            },
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.callCount(1)
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.callCount(1)
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.callCount(1)
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: {
            exception:
              'Multiple step definitions match:\n' +
              '  pattern1 - path/to/steps:3\n' +
              '  pattern2 - path/to/steps:4',
            status: Status.AMBIGUOUS,
          },
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.callCount(1)
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: {
            duration: 0,
            status: Status.AMBIGUOUS,
            exception:
              'Multiple step definitions match:\n' +
              '  pattern1 - path/to/steps:3\n' +
              '  pattern2 - path/to/steps:4',
          },
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })
    })

    describe('with an undefined step', () => {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [{ sourceLocation: { line: 2, uri: 'path/to/feature' } }],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.callCount(1)
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.callCount(1)
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.callCount(1)
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: { status: Status.UNDEFINED },
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.callCount(1)
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.UNDEFINED },
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })
    })

    describe('with a step when skipping', () => {
      beforeEach(async function() {
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true),
        }
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' },
            },
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.callCount(1)
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.callCount(1)
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.callCount(1)
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: { status: Status.SKIPPED },
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.callCount(1)
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.SKIPPED },
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })
    })

    describe('with a before hook and step when skipping', () => {
      beforeEach(async function() {
        const testCaseHookDefinition = new TestCaseHookDefinition({
          code() {
            throw new Error('error')
          },
          line: 4,
          options: {},
          uri: 'path/to/hooks',
        })
        this.supportCodeLibrary.beforeTestCaseHookDefinitions = [
          testCaseHookDefinition,
        ]
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true),
        }
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            { actionLocation: { line: 4, uri: 'path/to/hooks' } },
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' },
            },
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.callCount(1)
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.callCount(2)
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 1,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.callCount(2)
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: { status: Status.SKIPPED },
        })
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 1,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: { status: Status.SKIPPED },
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.callCount(1)
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.SKIPPED },
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })
    })

    describe('with an after hook when skipping', () => {
      beforeEach(async function() {
        const testCaseHookDefinition = new TestCaseHookDefinition({
          code() {
            throw new Error('error')
          },
          line: 4,
          options: {},
          uri: 'path/to/hooks',
        })
        this.supportCodeLibrary.afterTestCaseHookDefinitions = [
          testCaseHookDefinition,
        ]
        this.step = { uri: 'path/to/feature', locations: [{ line: 2 }] }
        const stepDefinition = {
          uri: 'path/to/steps',
          line: 3,
          matchesStepName: sinon.stub().returns(true),
        }
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.testCase.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.testCase,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        await scenarioRunner.run()
      })

      it('emits test-case-prepared', function() {
        expect(this.onTestCasePrepared).to.have.callCount(1)
        expect(this.onTestCasePrepared).to.have.been.calledWith({
          steps: [
            {
              actionLocation: { line: 3, uri: 'path/to/steps' },
              sourceLocation: { line: 2, uri: 'path/to/feature' },
            },
            { actionLocation: { line: 4, uri: 'path/to/hooks' } },
          ],
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-case-started', function() {
        expect(this.onTestCaseStarted).to.have.callCount(1)
        expect(this.onTestCaseStarted).to.have.been.calledWith({
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })

      it('emits test-step-started', function() {
        expect(this.onTestStepStarted).to.have.callCount(2)
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
        expect(this.onTestStepStarted).to.have.been.calledWith({
          index: 1,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
        })
      })

      it('emits test-step-finished', function() {
        expect(this.onTestStepFinished).to.have.callCount(2)
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 0,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: { status: Status.SKIPPED },
        })
        expect(this.onTestStepFinished).to.have.been.calledWith({
          index: 1,
          testCase: {
            attemptNumber: 1,
            sourceLocation: { line: 1, uri: 'path/to/feature' },
          },
          result: { status: Status.SKIPPED },
        })
      })

      it('emits test-case-finished', function() {
        expect(this.onTestCaseFinished).to.have.callCount(1)
        expect(this.onTestCaseFinished).to.have.been.calledWith({
          result: { duration: 0, status: Status.SKIPPED },
          attemptNumber: 1,
          sourceLocation: { line: 1, uri: 'path/to/feature' },
        })
      })
    })
  })
})
