import {getUsage} from './helpers'

describe('UsageHelpers', function() {
  describe('getUsage', function() {
    beforeEach(function() {
      this.cwd = 'path/to/project'
    })

    describe('no step definitions', function() {
      describe('no step results', function() {
        beforeEach(function() {
          this.result = getUsage({
            cwd: this.cwd,
            stepDefinitions: [],
            stepResults: []
          })
        })

        it('outputs an empty array', function () {
          expect(this.result).to.eql([])
        })
      })

      describe('with undefined step', function() {
        beforeEach(function() {
          const step = {
            line: 1,
            name: 'step-name1',
            uri: 'path/to/project/a.feature'
          }
          const stepResult = {step}
          this.result = getUsage({
            cwd: this.cwd,
            stepDefinitions: [],
            stepResults: [stepResult]
          })
        })

        it('outputs an empty array', function () {
          expect(this.result).to.eql([])
        })
      })
    })

    describe('with one step definition', function() {
      beforeEach(function() {
        this.stepDefinition = {
          line: 1,
          pattern: 'abc',
          uri: 'path/to/project/steps.js'
        }
      })

      describe('unused', function() {
        beforeEach(function() {
          this.result = getUsage({
            cwd: this.cwd,
            stepDefinitions: [this.stepDefinition],
            stepResults: []
          })
        })

        it('outputs the step definition with no matches', function () {
          expect(this.result).to.eql([{
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
        })

        describe('in dry run', function() {
          beforeEach(function() {
            this.result = getUsage({
              cwd: this.cwd,
              stepDefinitions: [this.stepDefinition],
              stepResults: [this.stepResult1, this.stepResult2]
            })
          })

          it('outputs the step definition with the matches', function () {
            expect(this.result).to.eql([{
              location: 'steps.js:1',
              matches: [
                {location: 'a.feature:1', text: 'step-name1'},
                {location: 'a.feature:2', text: 'step-name2'}
              ],
              pattern: 'abc'
            }])
          })
        })

        describe('not in dry run', function() {
          beforeEach(function() {
            this.stepResult1.duration = 1
            this.stepResult2.duration = 2
            this.result = getUsage({
              cwd: this.cwd,
              stepDefinitions: [this.stepDefinition],
              stepResults: [this.stepResult1, this.stepResult2]
            })
          })

          it('outputs the step definition with the matches, durations, and a mean duration', function () {
            expect(this.result).to.eql([{
              location: 'steps.js:1',
              matches: [
                {duration: 2, location: 'a.feature:2', text: 'step-name2'},
                {duration: 1, location: 'a.feature:1', text: 'step-name1'}
              ],
              meanDuration: 1.5,
              pattern: 'abc'
            }])
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
        this.result = getUsage({
          cwd: this.cwd,
          stepDefinitions: [
            stepDefinition1,
            stepDefinition2,
            stepDefinition3
          ],
          stepResults: [
            stepResult1,
            stepResult2
          ]
        })
      })

      it('orders by mean duration descending with unused steps at the end', function() {
        expect(this.result).to.eql([{
          location: 'steps.js:2',
          matches: [{duration: 2, location: 'a.feature:2', text: 'step-name2'}],
          meanDuration: 2,
          pattern: 'def'
        }, {
          location: 'steps.js:1',
          matches: [{duration: 1, location: 'a.feature:1', text: 'step-name1'}],
          meanDuration: 1,
          pattern: 'abc'
        }, {
          location: 'steps.js:3',
          matches: [],
          pattern: 'ghi'
        }])
      })
    })
  })
})
