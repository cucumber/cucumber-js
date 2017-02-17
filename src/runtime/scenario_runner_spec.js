import {expectToHearEvents} from '../../test/listener_helpers'
import EventBroadcaster from './event_broadcaster'
import HookDefinition from '../models/hook_definition'
import Promise from 'bluebird'
import ScenarioRunner from './scenario_runner'
import Status from '../status'
import StepRunner from './step_runner'

describe('ScenarioRunner', function () {
  beforeEach(function () {
    this.listener = createMock([
      'handleBeforeScenario',
      'handleBeforeStep',
      'handleStepResult',
      'handleAfterStep',
      'handleScenarioResult',
      'handleAfterScenario'
    ])
    this.eventBroadcaster = new EventBroadcaster({listeners: [this.listener]})
    this.scenario = createMock({
      getFeature: null,
      getSteps: []
    })
    this.supportCodeLibrary = {
      afterHookDefinitions: [],
      beforeHookDefinitions: [],
      defaultTimeout: 5000,
      stepDefinitions: [],
      parameterRegistry: {},
      World() {}
    }
    this.options = {}
    sinon.stub(StepRunner, 'run')
    this.scenarioRunner = new ScenarioRunner({
      eventBroadcaster: this.eventBroadcaster,
      options: this.options,
      scenario: this.scenario,
      supportCodeLibrary: this.supportCodeLibrary
    })
  })

  afterEach(function() {
    StepRunner.run.restore()
  })

  describe('run()', function () {
    describe('with no steps or hooks', function() {
      beforeEach(async function() {
        this.scenario.steps = []
        this.scenarioResult = await this.scenarioRunner.run()
      })

      it('broadcasts a scenario event', function() {
        expectToHearEvents(this.listener, [
          ['BeforeScenario', this.scenario],
          ['ScenarioResult', this.scenarioResult],
          ['AfterScenario', this.scenario]
        ])
      })

      it('returns a passing result', function() {
        expect(this.scenarioResult.status).to.eql(Status.PASSED)
      })
    })

    describe('with a passing step', function() {
      beforeEach(async function() {
        this.step = {}
        this.stepResult = {
          duration: 1,
          status: Status.PASSED,
          step: this.step
        }
        const stepDefinition = createMock({matchesStepName: true})
        StepRunner.run.returns(Promise.resolve(this.stepResult))
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.scenario.steps = [this.step]
        this.scenarioResult = await this.scenarioRunner.run()
      })

      it('broadcasts a scenario, step, stepResult and scenarioResult event', function() {
        expectToHearEvents(this.listener, [
          ['BeforeScenario', this.scenario],
          ['BeforeStep', this.step],
          ['StepResult', this.stepResult],
          ['AfterStep', this.step],
          ['ScenarioResult', this.scenarioResult],
          ['AfterScenario', this.scenario]
        ])
      })

      it('returns a passing result', function() {
        expect(this.scenarioResult.status).to.eql(Status.PASSED)
      })
    })

    describe('with a failing step', function() {
      beforeEach(async function() {
        this.step = {}
        this.stepResult = {
          duration: 1,
          status: Status.FAILED,
          step: this.step
        }
        const stepDefinition = createMock({matchesStepName: true})
        StepRunner.run.returns(Promise.resolve(this.stepResult))
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.scenario.steps = [this.step]
        this.scenarioResult = await this.scenarioRunner.run()
      })

      it('broadcasts a scenario, step and stepResult event', function() {
        expectToHearEvents(this.listener, [
          ['BeforeScenario', this.scenario],
          ['BeforeStep', this.step],
          ['StepResult', this.stepResult],
          ['AfterStep', this.step],
          ['ScenarioResult', this.scenarioResult],
          ['AfterScenario', this.scenario]
        ])
      })

      it('returns a failed result', function() {
        expect(this.scenarioResult.status).to.eql(Status.FAILED)
      })
    })

    describe('with an ambiguous step', function() {
      beforeEach(async function() {
        this.step = {}
        const stepDefinition = createMock({matchesStepName: true})
        this.supportCodeLibrary.stepDefinitions = [stepDefinition, stepDefinition]
        this.scenario.steps = [this.step]
        this.scenarioResult = await this.scenarioRunner.run()
      })

      it('broadcasts the expected events', function() {
        expectToHearEvents(this.listener, [
          ['BeforeScenario', this.scenario],
          ['BeforeStep', this.step],
          ['StepResult', function(stepResult) {
            expect(stepResult.status).to.eql(Status.AMBIGUOUS)
          }],
          ['AfterStep', this.step],
          ['ScenarioResult', this.scenarioResult],
          ['AfterScenario', this.scenario]
        ])
      })

      it('returns a failed result', function() {
        expect(this.scenarioResult.status).to.eql(Status.AMBIGUOUS)
      })
    })

    describe('with an undefined step', function() {
      beforeEach(async function() {
        this.step = {}
        this.scenario.steps = [this.step]
        this.scenarioResult = await this.scenarioRunner.run()
      })

      it('broadcasts the expected events', function() {
        expectToHearEvents(this.listener, [
          ['BeforeScenario', this.scenario],
          ['BeforeStep', this.step],
          ['StepResult', function(stepResult) {
            expect(stepResult.status).to.eql(Status.UNDEFINED)
          }],
          ['AfterStep', this.step],
          ['ScenarioResult', this.scenarioResult],
          ['AfterScenario', this.scenario]
        ])
      })

      it('returns a failed result', function() {
        expect(this.scenarioResult.status).to.eql(Status.UNDEFINED)
      })
    })

    describe('with a step in dry run mode', function() {
      beforeEach(async function() {
        this.options.dryRun = true
        this.step = {}
        const stepDefinition = createMock({matchesStepName: true})
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.scenario.steps = [this.step]
        this.scenarioResult = await this.scenarioRunner.run()
      })

      it('broadcasts the expected events', function() {
        expectToHearEvents(this.listener, [
          ['BeforeScenario', this.scenario],
          ['BeforeStep', this.step],
          ['StepResult', function(stepResult) {
            expect(stepResult.status).to.eql(Status.SKIPPED)
          }],
          ['AfterStep', this.step],
          ['ScenarioResult', this.scenarioResult],
          ['AfterScenario', this.scenario]
        ])
      })

      it('returns a skipped result', function() {
        expect(this.scenarioResult.status).to.eql(Status.SKIPPED)
      })
    })

    describe('with an before hook and step in dry run mode', function() {
      beforeEach(async function() {
        this.options.dryRun = true
        const hookDefinition = new HookDefinition({
          code() { throw new Error('error') },
          options: {}
        })
        this.step = {}
        const stepDefinition = createMock({matchesStepName: true})
        this.supportCodeLibrary.beforeHookDefinitions = [hookDefinition]
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.scenario.steps = [this.step]
        this.scenarioResult = await this.scenarioRunner.run()
      })

      it('broadcasts the expected events', function() {
        expectToHearEvents(this.listener, [
          ['BeforeScenario', this.scenario],
          ['BeforeStep', function(step) {
            expect(step.keyword).to.eql('Before')
          }],
          ['StepResult', function(stepResult) {
            expect(stepResult.status).to.eql(Status.SKIPPED)
          }],
          ['AfterStep', function(step) {
            expect(step.keyword).to.eql('Before')
          }],
          ['BeforeStep', this.step],
          ['StepResult', function(stepResult) {
            expect(stepResult.status).to.eql(Status.SKIPPED)
          }],
          ['AfterStep', this.step],
          ['ScenarioResult', this.scenarioResult],
          ['AfterScenario', this.scenario]
        ])
      })

      it('returns a skipped result', function() {
        expect(this.scenarioResult.status).to.eql(Status.SKIPPED)
      })
    })

    describe('with an after hook and step in dry run mode', function() {
      beforeEach(async function() {
        this.options.dryRun = true
        const hookDefinition = new HookDefinition({
          code() { throw new Error('error') },
          options: {}
        })
        this.step = {}
        const stepDefinition = createMock({matchesStepName: true})
        this.supportCodeLibrary.afterHookDefinitions = [hookDefinition]
        this.supportCodeLibrary.stepDefinitions = [stepDefinition]
        this.scenario.steps = [this.step]
        this.scenarioResult = await this.scenarioRunner.run()
      })

      it('broadcasts the expected events', function() {
        expectToHearEvents(this.listener, [
          ['BeforeScenario', this.scenario],
          ['BeforeStep', this.step],
          ['StepResult', function(stepResult) {
            expect(stepResult.status).to.eql(Status.SKIPPED)
          }],
          ['AfterStep', this.step],
          ['BeforeStep', function(step) {
            expect(step.keyword).to.eql('After')
          }],
          ['StepResult', function(stepResult) {
            expect(stepResult.status).to.eql(Status.SKIPPED)
          }],
          ['AfterStep', function(step) {
            expect(step.keyword).to.eql('After')
          }],
          ['ScenarioResult', this.scenarioResult],
          ['AfterScenario', this.scenario]
        ])
      })

      it('returns a skipped result', function() {
        expect(this.scenarioResult.status).to.eql(Status.SKIPPED)
      })
    })
  })
})
