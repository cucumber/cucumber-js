import ScenarioHookDefinition from './scenario_hook_definition'

describe('ScenarioHookDefinition', function() {
  describe('appliesToScenario', function() {
    beforeEach(function() {
      this.scenario = {
        tags: [],
        uri: ''
      }
    })

    describe('no tags', function() {
      beforeEach(function() {
        this.scenariohookDefinition = new ScenarioHookDefinition({ options: {} })
      })

      it('returns true', function() {
        expect(this.scenariohookDefinition.appliesToScenario(this.scenario)).to.be.true
      })
    })

    describe('tags match', function() {
      beforeEach(function() {
        this.scenario.tags = [{ name: '@tagA' }]
        this.scenariohookDefinition = new ScenarioHookDefinition({
          options: { tags: '@tagA' }
        })
      })

      it('returns true', function() {
        expect(this.scenariohookDefinition.appliesToScenario(this.scenario)).to.be.true
      })
    })

    describe('tags do not match', function() {
      beforeEach(function() {
        this.scenariohookDefinition = new ScenarioHookDefinition({
          options: { tags: '@tagA' }
        })
      })

      it('returns false', function() {
        expect(this.scenariohookDefinition.appliesToScenario(this.scenario)).to.be.false
      })
    })
  })
})
