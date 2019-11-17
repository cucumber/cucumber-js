import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import PickleRunner from './pickle_runner'
import StepRunner from './step_runner'
import { EventEmitter } from 'events'
import uuidv4 from 'uuid/v4'
import { messages } from 'cucumber-messages'

const { Status }= messages.TestResult

describe('PickleRunner', () => {
  beforeEach(function() {
    this.onEnvelope = sinon.stub()
    this.eventBroadcaster = new EventEmitter()
    this.eventBroadcaster.on('envelope', this.onEnvelope)
    this.pickle = {
      id: uuidv4(),
      steps: [],
    }
    this.onWorldConstructed = sinon.stub()
    const owc = this.onWorldConstructed
    this.supportCodeLibrary = {
      afterTestCaseHookDefinitions: [],
      beforeTestCaseHookDefinitions: [],
      defaultTimeout: 5000,
      stepDefinitions: [],
      parameterTypeRegistry: {},
      World() {
        owc()
      },
    }
    sinon.stub(StepRunner, 'run')
  })

  afterEach(() => {
    StepRunner.run.restore()
  })

  describe('run()', () => {
    describe('with no steps or hooks', () => {
      beforeEach(async function() {
        const pickleRunner = new PickleRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          pickle: this.pickle,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        this.result = await pickleRunner.run()
      })

      it('emits 3 events', function() {
        expect(this.onEnvelope).to.have.callCount(3)
      })

      it('emits test case', function() {
        const envelope = this.onEnvelope.getCall(0).args[0]
        expect(envelope.testCase).to.exist;
        expect(envelope.testCase.id).to.exist;
        expect(envelope.testCase.pickleId).to.eql(this.pickle.id);
        expect(envelope.testCase.steps).to.eql([]);
      })

      it('emits test case started', function() {
        const testCaseId = this.onEnvelope.getCall(0).args[0].testCase.id;
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.testCaseStarted).to.exist;
        expect(envelope.testCaseStarted.id).to.exist;
        expect(envelope.testCaseStarted.testCaseId).to.eql(testCaseId)
      })

      it('emits test case finished', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const envelope = this.onEnvelope.getCall(2).args[0]
        expect(envelope.testCaseFinished).to.exist;
        expect(envelope.testCaseFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testCaseFinished.testResult).to.eql({ duration: 0, status: Status.PASSED })
      })

      it('returns the test case result', function() {
        expect(this.result).to.eql({
          duration: 0,
          status: Status.PASSED,
        })
      })
    })

    describe('with a passing step', () => {
      beforeEach(async function() {
        this.pickleStep = {
          id: uuidv4(),
        }
        this.stepResult = {
          duration: 1,
          status: Status.PASSED,
        }
        this.stepDefinition = {
          id: uuidv4(),
          matchesStepName: sinon.stub().returns(true),
        }
        StepRunner.run.resolves(this.stepResult)
        this.supportCodeLibrary.stepDefinitions = [this.stepDefinition]
        this.pickle.steps = [this.pickleStep]
        const pickleRunner = new PickleRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          pickle: this.pickle,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        this.result = await pickleRunner.run()
      })

      it('emits 5 events', function() {
        expect(this.onEnvelope).to.have.callCount(5)
      })

      it('emits test case', function() {
        const envelope = this.onEnvelope.getCall(0).args[0]
        expect(envelope.testCase).to.exist;
        expect(envelope.testCase.id).to.exist;
        expect(envelope.testCase.pickleId).to.eql(this.pickle.id);
        expect(envelope.testCase.steps.length).to.eql(1);
        expect(envelope.testCase.steps[0].id).to.exist;
        expect(envelope.testCase.steps[0].pickleStepId).to.eql(this.pickleStep.id)
        expect(envelope.testCase.steps[0].stepDefinitionId).to.eql([this.stepDefinition.id])
      })

      it('emits test case started', function() {
        const testCaseId = this.onEnvelope.getCall(0).args[0].testCase.id;
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.testCaseStarted).to.exist;
        expect(envelope.testCaseStarted.id).to.exist;
        expect(envelope.testCaseStarted.attempt).to.eql(0)
        expect(envelope.testCaseStarted.testCaseId).to.eql(testCaseId)
      })

      it('emits test step started', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const testStepId = this.onEnvelope.getCall(0).args[0].testCase.steps[0].id;
        const envelope = this.onEnvelope.getCall(2).args[0]
        expect(envelope.testStepStarted).to.exist;
        expect(envelope.testStepStarted.testStepId).to.eql(testStepId);
        expect(envelope.testStepStarted.testCaseStartedId).to.eql(testCaseStartedId)
      })

      it('emits test step finished', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const testStepId = this.onEnvelope.getCall(0).args[0].testCase.steps[0].id;
        const envelope = this.onEnvelope.getCall(3).args[0]
        expect(envelope.testStepFinished).to.exist;
        expect(envelope.testStepFinished.testStepId).to.eql(testStepId);
        expect(envelope.testStepFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testStepFinished.testResult).to.eql({ duration: 1, status: Status.PASSED })
      })

      it('emits test case finished', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const envelope = this.onEnvelope.getCall(4).args[0]
        expect(envelope.testCaseFinished).to.exist;
        expect(envelope.testCaseFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testCaseFinished.testResult).to.eql({ duration: 1, status: Status.PASSED })
      })

      it('returns the test case result', function() {
        expect(this.result).to.eql({
          duration: 1,
          status: Status.PASSED,
        })
      })
    })

    describe('with a failing step', () => {
      beforeEach(async function() {
        this.pickleStep = {
          id: uuidv4(),
        }
        this.error = new Error('a')
        this.stepResult = {
          duration: 1,
          status: Status.FAILED,
          exception: this.error,
        }
        this.stepDefinition = {
          id: uuidv4(),
          matchesStepName: sinon.stub().returns(true),
        }
        StepRunner.run.resolves(this.stepResult)
        this.supportCodeLibrary.stepDefinitions = [this.stepDefinition]
        this.pickle.steps = [this.pickleStep]
        const pickleRunner = new PickleRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          pickle: this.pickle,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        this.result = await pickleRunner.run()
      })

      it('emits 5 events', function() {
        expect(this.onEnvelope).to.have.callCount(5)
      })

      it('emits test case', function() {
        const envelope = this.onEnvelope.getCall(0).args[0]
        expect(envelope.testCase).to.exist;
        expect(envelope.testCase.id).to.exist;
        expect(envelope.testCase.pickleId).to.eql(this.pickle.id);
        expect(envelope.testCase.steps.length).to.eql(1);
        expect(envelope.testCase.steps[0].id).to.exist;
        expect(envelope.testCase.steps[0].pickleStepId).to.eql(this.pickleStep.id)
        expect(envelope.testCase.steps[0].stepDefinitionId).to.eql([this.stepDefinition.id])
      })

      it('emits test case started', function() {
        const testCaseId = this.onEnvelope.getCall(0).args[0].testCase.id;
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.testCaseStarted).to.exist;
        expect(envelope.testCaseStarted.id).to.exist;
        expect(envelope.testCaseStarted.attempt).to.eql(0)
        expect(envelope.testCaseStarted.testCaseId).to.eql(testCaseId)
      })

      it('emits test step started', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const testStepId = this.onEnvelope.getCall(0).args[0].testCase.steps[0].id;
        const envelope = this.onEnvelope.getCall(2).args[0]
        expect(envelope.testStepStarted).to.exist;
        expect(envelope.testStepStarted.testStepId).to.eql(testStepId);
        expect(envelope.testStepStarted.testCaseStartedId).to.eql(testCaseStartedId)
      })

      it('emits test step finished', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const testStepId = this.onEnvelope.getCall(0).args[0].testCase.steps[0].id;
        const envelope = this.onEnvelope.getCall(3).args[0]
        expect(envelope.testStepFinished).to.exist;
        expect(envelope.testStepFinished.testStepId).to.eql(testStepId);
        expect(envelope.testStepFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testStepFinished.testResult).to.eql({
          duration: 1,
          status: Status.FAILED,
          exception: this.error,
        })
      })

      it('emits test case finished', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const envelope = this.onEnvelope.getCall(4).args[0]
        expect(envelope.testCaseFinished).to.exist;
        expect(envelope.testCaseFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testCaseFinished.testResult).to.eql({
          duration: 1,
          status: Status.FAILED,
          exception: this.error,
        })
      })

      it('returns the test case result', function() {
        expect(this.result).to.eql({
          duration: 1,
          status: Status.FAILED,
          exception: this.error,
        })
      })
    })

    describe('with a flaky step and a positive retries value', () => {
      beforeEach(async function() {
        this.pickleStep = {
          id: uuidv4(),
        }
        this.error = new Error('a')
        this.stepDefinition = {
          id: uuidv4(),
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
        this.supportCodeLibrary.stepDefinitions = [this.stepDefinition]
        this.pickle.steps = [this.pickleStep]
        const pickleRunner = new PickleRunner({
          eventBroadcaster: this.eventBroadcaster,
          retries: 1,
          skip: false,
          pickle: this.pickle,
          supportCodeLibrary: this.supportCodeLibrary,
        })
        this.result = await pickleRunner.run()
      })

      it('emits 9 events', function() {
        expect(this.onEnvelope).to.have.callCount(9)
      })

      it('emits test case', function() {
        const envelope = this.onEnvelope.getCall(0).args[0]
        expect(envelope.testCase).to.exist;
        expect(envelope.testCase.id).to.exist;
        expect(envelope.testCase.pickleId).to.eql(this.pickle.id);
        expect(envelope.testCase.steps.length).to.eql(1);
        expect(envelope.testCase.steps[0].id).to.exist;
        expect(envelope.testCase.steps[0].pickleStepId).to.eql(this.pickleStep.id)
        expect(envelope.testCase.steps[0].stepDefinitionId).to.eql([this.stepDefinition.id])
      })

      it('emits test case started (attempt 0)', function() {
        const testCaseId = this.onEnvelope.getCall(0).args[0].testCase.id;
        const envelope = this.onEnvelope.getCall(1).args[0]
        expect(envelope.testCaseStarted).to.exist;
        expect(envelope.testCaseStarted.id).to.exist;
        expect(envelope.testCaseStarted.attempt).to.eql(0)
        expect(envelope.testCaseStarted.testCaseId).to.eql(testCaseId)
      })

      it('emits test step started (attempt 0)', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const testStepId = this.onEnvelope.getCall(0).args[0].testCase.steps[0].id;
        const envelope = this.onEnvelope.getCall(2).args[0]
        expect(envelope.testStepStarted).to.exist;
        expect(envelope.testStepStarted.testStepId).to.eql(testStepId);
        expect(envelope.testStepStarted.testCaseStartedId).to.eql(testCaseStartedId)
      })

      it('emits test step finished (attempt 0)', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const testStepId = this.onEnvelope.getCall(0).args[0].testCase.steps[0].id;
        const envelope = this.onEnvelope.getCall(3).args[0]
        expect(envelope.testStepFinished).to.exist;
        expect(envelope.testStepFinished.testStepId).to.eql(testStepId);
        expect(envelope.testStepFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testStepFinished.testResult).to.eql({
          duration: 1,
          status: Status.FAILED,
          exception: this.error,
        })
      })

      it('emits test case finished (attempt 0)', function() {
        const testCaseStartedId = this.onEnvelope.getCall(1).args[0].testCaseStarted.id;
        const envelope = this.onEnvelope.getCall(4).args[0]
        expect(envelope.testCaseFinished).to.exist;
        expect(envelope.testCaseFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testCaseFinished.testResult).to.eql({
          duration: 1,
          status: Status.FAILED,
          exception: this.error,
          willBeRetried: true
        })
      })

      it('emits test case started (attempt 1)', function() {
        const testCaseId = this.onEnvelope.getCall(0).args[0].testCase.id;
        const envelope = this.onEnvelope.getCall(5).args[0]
        expect(envelope.testCaseStarted).to.exist;
        expect(envelope.testCaseStarted.id).to.exist;
        expect(envelope.testCaseStarted.attempt).to.eql(1)
        expect(envelope.testCaseStarted.testCaseId).to.eql(testCaseId)
      })

      it('emits test step started (attempt 1)', function() {
        const testCaseStartedId = this.onEnvelope.getCall(5).args[0].testCaseStarted.id;
        const testStepId = this.onEnvelope.getCall(0).args[0].testCase.steps[0].id;
        const envelope = this.onEnvelope.getCall(6).args[0]
        expect(envelope.testStepStarted).to.exist;
        expect(envelope.testStepStarted.testStepId).to.eql(testStepId);
        expect(envelope.testStepStarted.testCaseStartedId).to.eql(testCaseStartedId)
      })

      it('emits test step finished (attempt 1)', function() {
        const testCaseStartedId = this.onEnvelope.getCall(5).args[0].testCaseStarted.id;
        const testStepId = this.onEnvelope.getCall(0).args[0].testCase.steps[0].id;
        const envelope = this.onEnvelope.getCall(7).args[0]
        expect(envelope.testStepFinished).to.exist;
        expect(envelope.testStepFinished.testStepId).to.eql(testStepId);
        expect(envelope.testStepFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testStepFinished.testResult).to.eql({
          duration: 1,
          status: Status.PASSED,
        })
      })

      it('emits test case finished (attempt 1)', function() {
        const testCaseStartedId = this.onEnvelope.getCall(5).args[0].testCaseStarted.id;
        const envelope = this.onEnvelope.getCall(8).args[0]
        expect(envelope.testCaseFinished).to.exist;
        expect(envelope.testCaseFinished.testCaseStartedId).to.eql(testCaseStartedId)
        expect(envelope.testCaseFinished.testResult).to.eql({
          duration: 1,
          status: Status.PASSED,
        })
      })

      it('returns the second test case attempt result', function() {
        expect(this.result).to.eql({
          duration: 1,
          status: Status.PASSED,
        })
      })

      it('constructs the World twice', function() {
        expect(this.onWorldConstructed).to.have.callCount(2)
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
        this.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.pickle,
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
        this.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: false,
          testCase: this.pickle,
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
        this.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.pickle,
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
        this.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.pickle,
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
        this.pickle.steps = [this.step]
        const scenarioRunner = new TestCaseRunner({
          eventBroadcaster: this.eventBroadcaster,
          skip: true,
          testCase: this.pickle,
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
