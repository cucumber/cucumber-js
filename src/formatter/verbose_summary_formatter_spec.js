import _ from 'lodash'
import VerboseSummaryFormatter from './verbose_summary_formatter'
import getColorFns from './get_color_fns'
import Status from '../status'
import figures from 'figures'
import Step from '../models/step'
import DataTable from '../models/step_arguments/data_table'
import DocString from '../models/step_arguments/doc_string'

describe('VerboseSummaryFormatter', function() {
  beforeEach(function() {
    this.output = ''
    const colorFns = getColorFns(false)
    const logFn = (data) => {
      this.output += data
    }
    this.verboseSummaryFormatter = new VerboseSummaryFormatter({
      colorFns,
      log: logFn
    })
  })

  describe('before scenario', function() {
    beforeEach(function(){
      this.scenario = {
        keyword: 'scenario-keyword',
        name: 'scenario-name',
        tags: []
      }
    })

    describe('without tags or description', function() {
      it('scenario step output should be empty', function() {
        expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.be.undefined
      })
    })
  })

  describe('step result', function() {
    beforeEach(function() {
      this.step = Object.create(Step.prototype)
      _.assign(this.step, {
        arguments: [],
        keyword: 'step-keyword ',
        name: 'step-name'
      })
      this.stepResult = {
        status: Status.PASSED,
        step: this.step
      }
    })

    describe('failed step', function () {
      beforeEach(function () {
        this.stepResult.status = Status.FAILED
        this.verboseSummaryFormatter.handleStepResult(this.stepResult)
      })

      it('step output should have the keyword and name', function () {
        expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.be.an('array')
        expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.eql(
          ['  ' + figures.cross + ' step-keyword step-name\n']
        )
      })
    })

    describe('passed', function() {
      describe('without name', function() {
        beforeEach(function() {
          delete this.step.name
          this.verboseSummaryFormatter.handleStepResult(this.stepResult)
        })

        it('step output should have the keyword', function () {
          expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.be.an('array')
          expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.eql(
            ['  ' + figures.tick + ' step-keyword \n']
          )
        })
      })

      describe('with name', function() {
        beforeEach(function() {
          this.verboseSummaryFormatter.handleStepResult(this.stepResult)
        })

        it('step output should have the keyword and name', function () {
          expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.be.an('array')
          expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.eql(
            ['  ' + figures.tick + ' step-keyword step-name\n']
          )
        })
      })

      describe('with data table', function () {
        beforeEach(function() {
          const dataTable = Object.create(DataTable.prototype)
          _.assign(dataTable, createMock({
            raw: [
              ['cuk', 'cuke', 'cukejs'],
              ['c',   'cuke', 'cuke.js'],
              ['cu',  'cuke', 'cucumber']
            ]
          }))
          this.step.arguments = [dataTable]
          this.verboseSummaryFormatter.handleStepResult(this.stepResult)
        })

        it('step output should have the keyword and name and data table', function () {
          expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.be.an('array')
          expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.eql(
            ['  ' + figures.tick + ' step-keyword step-name\n' +
            '      | cuk | cuke | cukejs   |\n' +
            '      | c   | cuke | cuke.js  |\n' +
            '      | cu  | cuke | cucumber |\n']
          )
        })
      })

      describe('with doc string', function() {
        beforeEach(function () {
          const docString = Object.create(DocString.prototype)
          docString.content = 'this is a multiline\ndoc string\n\n:-)'
          this.step.arguments = [docString]
          this.verboseSummaryFormatter.handleStepResult(this.stepResult)
        })

        it('step output should have the keyword and name and doc string', function () {
          expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.eql(
            ['  ' + figures.tick + ' step-keyword step-name\n' +
            '      """\n' +
            '      this is a multiline\n' +
            '      doc string\n' +
            '\n' +
            '      :-)\n' +
            '      """\n']
          )
        })
      })
    })

    describe('pending', function () {
      beforeEach(function () {
        this.stepResult.status = Status.PENDING
        this.verboseSummaryFormatter.handleStepResult(this.stepResult)
      })

      it('step output should have the keyword and name', function () {
        expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.eql(
          ['  ? step-keyword step-name\n']
        )
      })
    })

    describe('skipped', function () {
      beforeEach(function () {
        this.stepResult.status = Status.SKIPPED
        this.verboseSummaryFormatter.handleStepResult(this.stepResult)
      })

      it('step output should have the keyword and name', function () {
        expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.eql(
          ['  - step-keyword step-name\n']
        )
      })
    })

    describe('undefined', function () {
      beforeEach(function () {
        this.stepResult.status = Status.UNDEFINED
        this.verboseSummaryFormatter.handleStepResult(this.stepResult)
      })

      it('step output should have the keyword and name', function () {
        expect(this.verboseSummaryFormatter.scenarioStepsOutput).to.eql(
          ['  ? step-keyword step-name\n']
        )
      })
    })
  })

  describe('after scenario', function() {
    beforeEach(function(){
      this.scenario = {
        keyword: 'scenario-keyword',
        name: 'scenario-name',
        tags: []
      }
    })

    describe('without tags or description', function() {
      describe('step result', function() {
        beforeEach(function() {
          this.step = Object.create(Step.prototype)
          _.assign(this.step, {
            arguments: [],
            keyword: 'step-keyword ',
            name: 'step-name'
          })
          this.stepResult = {
            status: Status.PASSED,
            step: this.step
          }
        })

        describe('failed step', function () {
          beforeEach(function () {
            this.stepResult.status = Status.FAILED
            this.verboseSummaryFormatter.handleStepResult(this.stepResult)
            this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
          })

          it('step output should have the keyword and name', function () {
            expect(this.output).to.eql(
              '  scenario-keyword: scenario-name\n' +
              '  ' + figures.cross + ' step-keyword step-name\n'
            )
          })
        })

        describe('passed', function() {
          describe('without name', function() {
            beforeEach(function() {
              delete this.step.name
              this.verboseSummaryFormatter.handleStepResult(this.stepResult)
              this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
            })

            it('step output should have the keyword', function () {
              expect(this.output).to.eql(
                '  scenario-keyword: scenario-name\n' +
                '  ' + figures.tick + ' step-keyword \n'
              )
            })
          })

          describe('with name', function() {
            beforeEach(function() {
              this.verboseSummaryFormatter.handleStepResult(this.stepResult)
              this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
            })

            it('step output should have the keyword and name', function () {
              expect(this.output).to.eql(
                '  scenario-keyword: scenario-name\n' +
                '  ' + figures.tick + ' step-keyword step-name\n'
              )
            })
          })

          describe('with data table', function () {
            beforeEach(function() {
              const dataTable = Object.create(DataTable.prototype)
              _.assign(dataTable, createMock({
                raw: [
                  ['cuk', 'cuke', 'cukejs'],
                  ['c',   'cuke', 'cuke.js'],
                  ['cu',  'cuke', 'cucumber']
                ]
              }))
              this.step.arguments = [dataTable]
              this.verboseSummaryFormatter.handleStepResult(this.stepResult)
              this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
            })

            it('step output should have the keyword and name and data table', function () {
              expect(this.output).to.eql(
                '  scenario-keyword: scenario-name\n' +
                '  ' + figures.tick + ' step-keyword step-name\n' +
                '      | cuk | cuke | cukejs   |\n' +
                '      | c   | cuke | cuke.js  |\n' +
                '      | cu  | cuke | cucumber |\n'
              )
            })
          })

          describe('with doc string', function() {
            beforeEach(function () {
              const docString = Object.create(DocString.prototype)
              docString.content = 'this is a multiline\ndoc string\n\n:-)'
              this.step.arguments = [docString]
              this.verboseSummaryFormatter.handleStepResult(this.stepResult)
              this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
            })

            it('step output should have the keyword and name and doc string', function () {
              expect(this.output).to.eql(
                '  scenario-keyword: scenario-name\n' +
                '  ' + figures.tick + ' step-keyword step-name\n' +
                '      """\n' +
                '      this is a multiline\n' +
                '      doc string\n' +
                '\n' +
                '      :-)\n' +
                '      """\n'
              )
            })
          })
        })

        describe('pending', function () {
          beforeEach(function () {
            this.stepResult.status = Status.PENDING
            this.verboseSummaryFormatter.handleStepResult(this.stepResult)
            this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
          })

          it('step output should have the keyword and name', function () {
            expect(this.output).to.eql(
              '  scenario-keyword: scenario-name\n' +
              '  ? step-keyword step-name\n'
            )
          })
        })

        describe('skipped', function () {
          beforeEach(function () {
            this.stepResult.status = Status.SKIPPED
            this.verboseSummaryFormatter.handleStepResult(this.stepResult)
            this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
          })

          it('step output should have the keyword and name', function () {
            expect(this.output).to.eql(
              '  scenario-keyword: scenario-name\n' +
              '  - step-keyword step-name\n'
            )
          })
        })

        describe('undefined', function () {
          beforeEach(function () {
            this.stepResult.status = Status.UNDEFINED
            this.verboseSummaryFormatter.handleStepResult(this.stepResult)
            this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
          })

          it('step output should have the keyword and name', function () {
            expect(this.output).to.eql(
              '  scenario-keyword: scenario-name\n' +
              '  ? step-keyword step-name\n'
            )
          })
        })
      })
    })

    describe('with tags', function() {
      beforeEach(function() {
        this.scenario.tags = [{name: '@tagA'}, {name: '@tagB'}]
      })

      describe('step result', function() {
        beforeEach(function() {
          this.step = Object.create(Step.prototype)
          _.assign(this.step, {
            arguments: [],
            keyword: 'step-keyword ',
            name: 'step-name'
          })
          this.stepResult = {
            status: Status.PASSED,
            step: this.step
          }
        })

        describe('failed step', function () {
          beforeEach(function () {
            this.stepResult.status = Status.FAILED
            this.verboseSummaryFormatter.handleStepResult(this.stepResult)
            this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
          })

          it('step output should have the keyword and name', function () {
            expect(this.output).to.eql(
              '@tagA @tagB\n' +
              '  scenario-keyword: scenario-name\n' +
              '  ' + figures.cross + ' step-keyword step-name\n'
            )
          })
        })

        describe('passed', function() {
          describe('without name', function() {
            beforeEach(function() {
              delete this.step.name
              this.verboseSummaryFormatter.handleStepResult(this.stepResult)
              this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
            })

            it('step output should have the keyword', function () {
              expect(this.output).to.eql(
                '@tagA @tagB\n' +
                '  scenario-keyword: scenario-name\n' +
                '  ' + figures.tick + ' step-keyword \n'
              )
            })
          })

          describe('with name', function() {
            beforeEach(function() {
              this.verboseSummaryFormatter.handleStepResult(this.stepResult)
              this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
            })

            it('step output should have the keyword and name', function () {
              expect(this.output).to.eql(
                '@tagA @tagB\n' +
                '  scenario-keyword: scenario-name\n' +
                '  ' + figures.tick + ' step-keyword step-name\n'
              )
            })
          })

          describe('with data table', function () {
            beforeEach(function() {
              const dataTable = Object.create(DataTable.prototype)
              _.assign(dataTable, createMock({
                raw: [
                  ['cuk', 'cuke', 'cukejs'],
                  ['c',   'cuke', 'cuke.js'],
                  ['cu',  'cuke', 'cucumber']
                ]
              }))
              this.step.arguments = [dataTable]
              this.verboseSummaryFormatter.handleStepResult(this.stepResult)
              this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
            })

            it('step output should have the keyword and name and data table', function () {
              expect(this.output).to.eql(
                '@tagA @tagB\n' +
                '  scenario-keyword: scenario-name\n' +
                '  ' + figures.tick + ' step-keyword step-name\n' +
                '      | cuk | cuke | cukejs   |\n' +
                '      | c   | cuke | cuke.js  |\n' +
                '      | cu  | cuke | cucumber |\n'
              )
            })
          })

          describe('with doc string', function() {
            beforeEach(function () {
              const docString = Object.create(DocString.prototype)
              docString.content = 'this is a multiline\ndoc string\n\n:-)'
              this.step.arguments = [docString]
              this.verboseSummaryFormatter.handleStepResult(this.stepResult)
              this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
            })

            it('step output should have the keyword and name and doc string', function () {
              expect(this.output).to.eql(
                '@tagA @tagB\n' +
                '  scenario-keyword: scenario-name\n' +
                '  ' + figures.tick + ' step-keyword step-name\n' +
                '      """\n' +
                '      this is a multiline\n' +
                '      doc string\n' +
                '\n' +
                '      :-)\n' +
                '      """\n'
              )
            })
          })
        })

        describe('pending', function () {
          beforeEach(function () {
            this.stepResult.status = Status.PENDING
            this.verboseSummaryFormatter.handleStepResult(this.stepResult)
            this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
          })

          it('step output should have the keyword and name', function () {
            expect(this.output).to.eql(
              '@tagA @tagB\n' +
              '  scenario-keyword: scenario-name\n' +
              '  ? step-keyword step-name\n'
            )
          })
        })

        describe('skipped', function () {
          beforeEach(function () {
            this.stepResult.status = Status.SKIPPED
            this.verboseSummaryFormatter.handleStepResult(this.stepResult)
            this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
          })

          it('step output should have the keyword and name', function () {
            expect(this.output).to.eql(
              '@tagA @tagB\n' +
              '  scenario-keyword: scenario-name\n' +
              '  - step-keyword step-name\n'
            )
          })
        })

        describe('undefined', function () {
          beforeEach(function () {
            this.stepResult.status = Status.UNDEFINED
            this.verboseSummaryFormatter.handleStepResult(this.stepResult)
            this.verboseSummaryFormatter.handleAfterScenario(this.scenario)
          })

          it('step output should have the keyword and name', function () {
            expect(this.output).to.eql(
              '@tagA @tagB\n' +
              '  scenario-keyword: scenario-name\n' +
              '  ? step-keyword step-name\n'
            )
          })
        })
      })
    })
  })
})
