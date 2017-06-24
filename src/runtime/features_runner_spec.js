import {expectToHearEvents} from '../../test/listener_helpers'
import EventBroadcaster from './event_broadcaster'
import FeaturesRunner from './features_runner'
import Promise from 'bluebird'
import ScenarioRunner from './scenario_runner'
import Status from '../status'

describe('FeaturesRunner', function () {
  beforeEach(function () {
    this.listener = createMock([
      'handleBeforeFeatures',
      'handleFeaturesResult',
      'handleAfterFeatures'
    ])
    this.eventBroadcaster = new EventBroadcaster({listeners: [this.listener]})
    this.features = []
    this.supportCodeLibrary = {
      defaultTimeout: 5000,
      transformLookuo: {},
      listeners: [],
      World() {}
    }
    this.scenarioFilter = createMock({matches: true})
    this.listeners = []
    this.options = {}
    sinon.stub(ScenarioRunner.prototype, 'run')
    this.featuresRunner = new FeaturesRunner({
      eventBroadcaster: this.eventBroadcaster,
      features: this.features,
      options: this.options,
      scenarioFilter: this.scenarioFilter,
      supportCodeLibrary: this.supportCodeLibrary
    })
  })

  afterEach(function() {
    ScenarioRunner.prototype.run.restore()
  })

  describe('run()', function () {
    describe('with no features', function() {
      beforeEach(async function() {
        this.result = await this.featuresRunner.run()
      })

      it('broadcasts features and featureResult events', function() {
        expectToHearEvents(this.listener, [
          ['BeforeFeatures', this.features],
          ['FeaturesResult', function(featureResult) {
            expect(featureResult.success).to.be.true
          }],
          ['AfterFeatures', this.features]
        ])
      })

      it('returns a successful result', function() {
        expect(this.result).to.be.true
      })
    })

    describe('with a feature with a passing scenario', function() {
      beforeEach(async function() {
        this.feature = {
          scenarios: [{}]
        }
        const scenarioResult = {
          duration: 1,
          status: Status.PASSED,
          stepCounts: {}
        }
        ScenarioRunner.prototype.run.returns(Promise.resolve(scenarioResult))
        this.features.push(this.feature)
        this.result = await this.featuresRunner.run()
      })

      it('broadcasts features and featuresResult event', function() {
        expectToHearEvents(this.listener, [
          ['BeforeFeatures', this.features],
          ['FeaturesResult', function(featureResult) {
            expect(featureResult.success).to.be.true
          }],
          ['AfterFeatures', this.features]
        ])
      })

      it('returns a successful result', function() {
        expect(this.result).to.be.true
      })
    })

    describe('with a feature with a failing scenario', function() {
      beforeEach(async function() {
        this.feature = {
          scenarios: [{}]
        }
        const scenarioResult = {
          duration: 1,
          status: Status.FAILED,
          stepCounts: {}
        }
        ScenarioRunner.prototype.run.returns(Promise.resolve(scenarioResult))
        this.features.push(this.feature)
        this.result = await this.featuresRunner.run()
      })

      it('broadcasts features and featuresResult event', function() {
        expectToHearEvents(this.listener, [
          ['BeforeFeatures', this.features],
          ['FeaturesResult', function(featureResult) {
            expect(featureResult.success).to.be.false
          }],
          ['AfterFeatures', this.features]
        ])
      })

      it('returns an unsuccessful result', function() {
        expect(this.result).to.be.false
      })
    })
  })
})
