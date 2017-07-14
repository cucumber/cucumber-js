import UsageJsonFormatter from './usage_json_formatter'

describe('UsageJsonFormatter', function() {
  describe('handleFeaturesResult', function() {
    beforeEach(function() {
      const stepDefinition1 = {
        line: 1,
        pattern: 'abc',
        uri: 'steps.js'
      }
      const stepDefinition2 = {
        line: 2,
        pattern: 'def',
        uri: 'steps.js'
      }
      const stepDefinition3 = {
        line: 3,
        pattern: 'ghi',
        uri: 'steps.js'
      }
      const step1 = {
        line: 1,
        name: 'step-name1',
        uri: 'a.feature'
      }
      const stepResult1 = {
        duration: 1,
        step: step1,
        stepDefinition: stepDefinition1
      }
      const step2 = {
        line: 2,
        name: 'step-name2',
        uri: 'a.feature'
      }
      const stepResult2 = {
        duration: 2,
        step: step2,
        stepDefinition: stepDefinition2
      }
      const featuresResult = {
        stepResults: [stepResult1, stepResult2]
      }
      const supportCodeLibrary = {
        stepDefinitions: [stepDefinition1, stepDefinition2, stepDefinition3]
      }
      this.output = ''
      const logFn = data => {
        this.output += data
      }
      const usageJsonFormatter = new UsageJsonFormatter({
        log: logFn,
        supportCodeLibrary
      })
      usageJsonFormatter.handleFeaturesResult(featuresResult)
    })

    it('outputs the usage in json format', function() {
      const parsedOutput = JSON.parse(this.output)
      expect(parsedOutput).to.eql([
        {
          line: 2,
          matches: [
            {
              duration: 2,
              line: 2,
              text: 'step-name2',
              uri: 'a.feature'
            }
          ],
          meanDuration: 2,
          pattern: 'def',
          uri: 'steps.js'
        },
        {
          line: 1,
          matches: [
            {
              duration: 1,
              line: 1,
              text: 'step-name1',
              uri: 'a.feature'
            }
          ],
          meanDuration: 1,
          pattern: 'abc',
          uri: 'steps.js'
        },
        {
          line: 3,
          matches: [],
          pattern: 'ghi',
          uri: 'steps.js'
        }
      ])
    })
  })
})
