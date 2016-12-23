import UsageFormatter from './usage_formatter'

describe('UsageFormatter', function () {
  beforeEach(function () {
    this.output = ''
    const logFn = (data) => {
      this.output += data
    }
    this.supportCodeLibrary = {
      stepDefinitions: []
    }
    this.featuresResult = {
      stepResults: []
    }
    this.usageFormatter = new UsageFormatter({
      cwd: 'path/to/project',
      log: logFn,
      supportCodeLibrary: this.supportCodeLibrary
    })
  })

  describe('no step definitions', function() {
    beforeEach(function() {
      this.usageFormatter.handleFeaturesResult(this.featuresResult)
    })

    it('outputs an empty array', function () {
      expect(JSON.parse(this.output)).to.eql([])
    })
  })

  describe('with one step definition', function() {
    beforeEach(function() {
      this.stepDefinition = {
        line: 1,
        pattern: 'abc',
        uri: 'path/to/project/steps.js'
      }
      this.supportCodeLibrary.stepDefinitions = [this.stepDefinition]
    })

    describe('unused', function() {
      beforeEach(function() {
        this.usageFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs the step definition with no matches', function () {
        expect(JSON.parse(this.output)).to.eql([{
          location: 'steps.js:1',
          matches: [],
          pattern: 'abc'
        }])
      })
    })

    describe('used', function() {
      beforeEach(function() {
        this.step1 = {
          line: 1,
          name: 'step-name1',
          uri: 'path/to/project/a.feature'
        }
        this.stepResult1 = {
          step: this.step1,
          stepDefinition: this.stepDefinition
        }
        this.step2 = {
          line: 2,
          name: 'step-name2',
          uri: 'path/to/project/a.feature'
        }
        this.stepResult2 = {
          step: this.step2,
          stepDefinition: this.stepDefinition
        }
        this.featuresResult.stepResults = [this.stepResult1, this.stepResult2]
      })

      describe('in dry run', function() {
        beforeEach(function() {
          this.usageFormatter.handleFeaturesResult(this.featuresResult)
        })

        it('outputs the step definition with the matches', function () {
          expect(JSON.parse(this.output)).to.eql([{
            location: 'steps.js:1',
            matches: [{
              text: 'step-name1',
              location: 'a.feature:1'
            }, {
              text: 'step-name2',
              location: 'a.feature:2'
            }],
            pattern: 'abc'
          }])
        })
      })

      describe('not in dry run', function() {
        beforeEach(function() {
          this.stepResult1.duration = 1
          this.stepResult2.duration = 2
          this.usageFormatter.handleFeaturesResult(this.featuresResult)
        })

        it('outputs the step definition with the matches, durations, and a mean duration', function () {
          expect(JSON.parse(this.output)).to.eql([{
            location: 'steps.js:1',
            matches: [{
              duration: 1,
              text: 'step-name1',
              location: 'a.feature:1'
            }, {
              duration: 2,
              text: 'step-name2',
              location: 'a.feature:2'
            }],
            meanDuration: 1.5,
            pattern: 'abc'
          }])
        })
      })
    })
  })

  describe('with multiple definition', function() {
    beforeEach(function() {
      this.stepDefinition1 = {
        line: 1,
        pattern: 'abc',
        uri: 'path/to/project/steps.js'
      }
      this.stepDefinition2 = {
        line: 2,
        pattern: 'def',
        uri: 'path/to/project/steps.js'
      }
      this.stepDefinition3 = {
        line: 3,
        pattern: 'ghi',
        uri: 'path/to/project/steps.js'
      }
      this.supportCodeLibrary.stepDefinitions = [
        this.stepDefinition1,
        this.stepDefinition2,
        this.stepDefinition3
      ]
      const step1 = {
        line: 1,
        name: 'step-name1',
        uri: 'path/to/project/a.feature'
      }
      const stepResult1 = {
        duration: 1,
        step: step1,
        stepDefinition: this.stepDefinition1
      }
      const step2 = {
        line: 2,
        name: 'step-name2',
        uri: 'path/to/project/a.feature'
      }
      const stepResult2 = {
        duration: 2,
        step: step2,
        stepDefinition: this.stepDefinition2
      }
      this.featuresResult.stepResults = [stepResult1, stepResult2]
      this.usageFormatter.handleFeaturesResult(this.featuresResult)
    })

    it('orders by mean duration descending with unused steps at the end', function() {
      expect(JSON.parse(this.output)).to.eql([{
        location: 'steps.js:2',
        matches: [{
          duration: 2,
          text: 'step-name2',
          location: 'a.feature:2'
        }],
        meanDuration: 2,
        pattern: 'def'
      }, {
        location: 'steps.js:1',
        matches: [{
          duration: 1,
          text: 'step-name1',
          location: 'a.feature:1'
        }],
        meanDuration: 1,
        pattern: 'abc'
      }, {
        location: 'steps.js:3',
        pattern: 'ghi'
      }])
    })
  })
})
