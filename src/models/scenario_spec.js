import Scenario from './scenario'

describe('Scenario', function() {
  beforeEach(function() {
    this.feature = {
      feature: 'data',
      uri: '/path/to/feature'
    }
    this.gherkinData = {
      locations: [{ line: 2 }]
    }
    this.lineToKeywordMapping = {}
    this.stepLineToKeywordMapping = { stepLine: 'data' }
    this.scenarioOptions = {
      feature: this.feature,
      gherkinData: this.gherkinData,
      language: 'en',
      lineToDescriptionMapping: this.lineToKeywordMapping,
      stepLineToKeywordMapping: this.stepLineToKeywordMapping
    }
  })

  describe('description', function() {
    beforeEach(function() {
      this.lineToKeywordMapping[2] = 'description'
      this.scenario = new Scenario(this.scenarioOptions)
    })

    it('returns the description', function() {
      expect(this.scenario.description).to.eql('description')
    })
  })

  describe('feature', function() {
    beforeEach(function() {
      this.scenario = new Scenario(this.scenarioOptions)
    })

    it('returns the feature', function() {
      expect(this.scenario.feature).to.eql({
        feature: 'data',
        uri: '/path/to/feature'
      })
    })
  })

  describe('keyword', function() {
    beforeEach(function() {
      this.scenario = new Scenario(this.scenarioOptions)
    })

    it('returns the keyword', function() {
      expect(this.scenario.keyword).to.eql('Scenario')
    })
  })

  describe('line', function() {
    beforeEach(function() {
      this.gherkinData.locations = [{ line: 1 }, { line: 2 }]
      this.scenario = new Scenario(this.scenarioOptions)
    })

    it('returns the first line number', function() {
      expect(this.scenario.line).to.eql(1)
    })
  })

  describe('lines', function() {
    beforeEach(function() {
      this.gherkinData.locations = [{ line: 1 }, { line: 2 }]
      this.scenario = new Scenario(this.scenarioOptions)
    })

    it('returns the line numbers', function() {
      expect(this.scenario.lines).to.eql([1, 2])
    })
  })

  describe('name', function() {
    beforeEach(function() {
      this.gherkinData.name = 'name'
      this.scenario = new Scenario(this.scenarioOptions)
    })

    it('returns the text', function() {
      expect(this.scenario.name).to.eql('name')
    })
  })

  describe('uri', function() {
    beforeEach(function() {
      this.scenario = new Scenario(this.scenarioOptions)
    })

    it('returns the feature uri', function() {
      expect(this.scenario.uri).to.eql('/path/to/feature')
    })
  })

  describe('steps', function() {
    beforeEach(function() {
      this.gherkinData.steps = [
        { locations: [{}], text: 'step1' },
        { locations: [{}], text: 'step2' }
      ]
      this.scenario = new Scenario(this.scenarioOptions)
    })

    it('returns the steps', function() {
      expect(this.scenario.steps).to.have.lengthOf(2)
    })
  })
})
