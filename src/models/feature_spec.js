import Feature from './feature'

describe('Feature', function() {
  beforeEach(function() {
    this.gherkinData = {
      language: 'en',
      location: { line: 1 }
    }
    this.featureOptions = {
      gherkinData: this.gherkinData,
      gherkinPickles: [],
      scenarioFilter: createMock({ matches: true }),
      uri: 'feature uri'
    }
  })

  describe('description', function() {
    beforeEach(function() {
      this.gherkinData.description = 'description'
      this.feature = new Feature(this.featureOptions)
    })

    it('returns the description', function() {
      expect(this.feature.description).to.eql('description')
    })
  })

  describe('keyword', function() {
    beforeEach(function() {
      this.gherkinData.keyword = 'Feature'
      this.feature = new Feature(this.featureOptions)
    })

    it('returns the keyword', function() {
      expect(this.feature.keyword).to.eql('Feature')
    })
  })

  describe('line', function() {
    beforeEach(function() {
      this.gherkinData.location = { line: 1 }
      this.feature = new Feature(this.featureOptions)
    })

    it('returns the line number', function() {
      expect(this.feature.line).to.eql(1)
    })
  })

  describe('name', function() {
    beforeEach(function() {
      this.gherkinData.name = 'name'
      this.feature = new Feature(this.featureOptions)
    })

    it('returns the text', function() {
      expect(this.feature.name).to.eql('name')
    })
  })

  describe('uri', function() {
    beforeEach(function() {
      this.featureOptions.uri = 'path1'
      this.feature = new Feature(this.featureOptions)
    })

    it('returns the first path', function() {
      expect(this.feature.uri).to.eql('path1')
    })
  })

  describe('scenarios', function() {
    beforeEach(function() {
      this.featureOptions.gherkinPickles = [
        { locations: [{}] },
        { locations: [{}] }
      ]
      this.featureOptions.scenarioFilter.matches
        .onCall(0)
        .returns(true)
        .onCall(1)
        .returns(false)
      this.feature = new Feature(this.featureOptions)
    })

    it('returns only the scenarios the match the filter', function() {
      expect(this.feature.scenarios).to.have.lengthOf(1)
    })
  })

  describe('step isBackground', function() {
    beforeEach(function() {
      this.gherkinData.children = [
        {
          location: {},
          type: 'Background',
          steps: [{ location: { line: 1 } }]
        }
      ]
      this.featureOptions.gherkinPickles = [
        {
          locations: [{}],
          steps: [{ locations: [{ line: 1 }] }, { locations: [{ line: 2 }] }]
        }
      ]
      this.feature = new Feature(this.featureOptions)
    })

    it('sets isBackground properly on steps', function() {
      const scenario = this.feature.scenarios[0]
      expect(scenario.steps[0].isBackground).to.be.true
      expect(scenario.steps[1].isBackground).to.be.false
    })
  })

  describe('scenario description', function() {
    beforeEach(function() {
      this.gherkinData.children = [
        {
          description: 'scenario description',
          location: { line: 1 },
          steps: []
        }
      ]
      this.featureOptions.gherkinPickles = [{ locations: [{ line: 1 }] }]
      this.feature = new Feature(this.featureOptions)
    })

    it('sets description properly on scenarios', function() {
      expect(this.feature.scenarios[0].description).to.eql(
        'scenario description'
      )
    })
  })

  describe('step keyword', function() {
    beforeEach(function() {
      this.gherkinData.children = [
        {
          location: {},
          steps: [
            {
              keyword: 'Given ',
              location: { line: 1 }
            }
          ]
        }
      ]
      this.featureOptions.gherkinPickles = [
        {
          locations: [{}],
          steps: [{ locations: [{ line: 1 }] }]
        }
      ]
      this.feature = new Feature(this.featureOptions)
    })

    it('sets keyword properly on steps', function() {
      const scenario = this.feature.scenarios[0]
      expect(scenario.steps[0].keyword).to.eql('Given ')
    })
  })
})
