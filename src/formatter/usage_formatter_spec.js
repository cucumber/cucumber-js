import UsageFormatter from './usage_formatter'

describe('UsageFormatter', function() {
  describe('handleFeaturesResult', function() {
    beforeEach(function() {
      this.output = ''
      const logFn = data => {
        this.output += data
      }
      this.featuresResult = {
        scenarioResults: [],
        stepResults: [],
        duration: 0
      }
      this.supportCodeLibrary = {
        stepDefinitions: []
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

      it('outputs "No step definitions"', function() {
        expect(this.output).to.eql('No step definitions')
      })
    })

    describe('with one step definition', function() {
      beforeEach(function() {
        this.stepDefinition = {
          line: 1,
          pattern: '/^abc?$/',
          uri: 'path/to/project/steps.js'
        }
        this.supportCodeLibrary.stepDefinitions = [this.stepDefinition]
      })

      describe('unused', function() {
        beforeEach(function() {
          this.usageFormatter.handleFeaturesResult(this.featuresResult)
        })

        it('outputs the step definition as unused', function() {
          expect(this.output).to.eql(
            '┌────────────────┬──────────┬────────────┐\n' +
              '│ Pattern / Text │ Duration │ Location   │\n' +
              '├────────────────┼──────────┼────────────┤\n' +
              '│ /^abc?$/       │ UNUSED   │ steps.js:1 │\n' +
              '└────────────────┴──────────┴────────────┘\n'
          )
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

          it('outputs the step definition without durations', function() {
            expect(this.output).to.eql(
              '┌────────────────┬──────────┬─────────────┐\n' +
                '│ Pattern / Text │ Duration │ Location    │\n' +
                '├────────────────┼──────────┼─────────────┤\n' +
                '│ /^abc?$/       │ -        │ steps.js:1  │\n' +
                '│   step-name1   │ -        │ a.feature:1 │\n' +
                '│   step-name2   │ -        │ a.feature:2 │\n' +
                '└────────────────┴──────────┴─────────────┘\n'
            )
          })
        })

        describe('not in dry run', function() {
          beforeEach(function() {
            this.stepResult1.duration = 0
            this.stepResult2.duration = 1
            this.usageFormatter.handleFeaturesResult(this.featuresResult)
          })

          it('outputs the step definition with durations in desending order', function() {
            expect(this.output).to.eql(
              '┌────────────────┬──────────┬─────────────┐\n' +
                '│ Pattern / Text │ Duration │ Location    │\n' +
                '├────────────────┼──────────┼─────────────┤\n' +
                '│ /^abc?$/       │ 0.5ms    │ steps.js:1  │\n' +
                '│   step-name2   │ 1ms      │ a.feature:2 │\n' +
                '│   step-name1   │ 0ms      │ a.feature:1 │\n' +
                '└────────────────┴──────────┴─────────────┘\n'
            )
          })
        })
      })
    })

    describe('with multiple definition', function() {
      beforeEach(function() {
        const stepDefinition1 = {
          line: 1,
          pattern: 'abc',
          uri: 'path/to/project/steps.js'
        }
        const stepDefinition2 = {
          line: 2,
          pattern: 'def',
          uri: 'path/to/project/steps.js'
        }
        const stepDefinition3 = {
          line: 3,
          pattern: 'ghi',
          uri: 'path/to/project/steps.js'
        }
        const step1 = {
          line: 1,
          name: 'step-name1',
          uri: 'path/to/project/a.feature'
        }
        const stepResult1 = {
          duration: 1,
          step: step1,
          stepDefinition: stepDefinition1
        }
        const step2 = {
          line: 2,
          name: 'step-name2',
          uri: 'path/to/project/a.feature'
        }
        const stepResult2 = {
          duration: 2,
          step: step2,
          stepDefinition: stepDefinition2
        }
        this.supportCodeLibrary.stepDefinitions = [
          stepDefinition1,
          stepDefinition2,
          stepDefinition3
        ]
        this.featuresResult.stepResults = [stepResult1, stepResult2]
        this.usageFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs the step definitions ordered by mean duration descending with unused steps at the end', function() {
        expect(this.output).to.eql(
          '┌────────────────┬──────────┬─────────────┐\n' +
            '│ Pattern / Text │ Duration │ Location    │\n' +
            '├────────────────┼──────────┼─────────────┤\n' +
            '│ def            │ 2ms      │ steps.js:2  │\n' +
            '│   step-name2   │ 2ms      │ a.feature:2 │\n' +
            '├────────────────┼──────────┼─────────────┤\n' +
            '│ abc            │ 1ms      │ steps.js:1  │\n' +
            '│   step-name1   │ 1ms      │ a.feature:1 │\n' +
            '├────────────────┼──────────┼─────────────┤\n' +
            '│ ghi            │ UNUSED   │ steps.js:3  │\n' +
            '└────────────────┴──────────┴─────────────┘\n'
        )
      })
    })
  })
})
