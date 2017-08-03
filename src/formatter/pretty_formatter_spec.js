import _ from 'lodash'
import DataTable from '../models/step_arguments/data_table'
import DocString from '../models/step_arguments/doc_string'
import figures from 'figures'
import getColorFns from './get_color_fns'
import PrettyFormatter from './pretty_formatter'
import Status from '../status'
import Step from '../models/step'

describe('PrettyFormatter', function() {
  beforeEach(function() {
    this.output = ''
    const colorFns = getColorFns(false)
    const logFn = data => {
      this.output += data
    }
    this.prettyFormatter = new PrettyFormatter({
      colorFns,
      log: logFn
    })
  })

  describe('before feature', function() {
    beforeEach(function() {
      this.feature = {
        keyword: 'feature-keyword',
        name: 'feature-name',
        description: '',
        tags: []
      }
    })

    describe('without tags or description', function() {
      beforeEach(function() {
        this.prettyFormatter.handleBeforeFeature(this.feature)
      })

      it('output the feature keyword and name', function() {
        expect(this.output).to.eql('feature-keyword: feature-name\n' + '\n')
      })
    })

    describe('with tags', function() {
      beforeEach(function() {
        this.feature.tags = [{ name: '@tagA' }, { name: '@tagB' }]
        this.prettyFormatter.handleBeforeFeature(this.feature)
      })

      it('outputs the tags seperated by spaces above the keyword and name', function() {
        expect(this.output).to.eql(
          '@tagA @tagB\n' + 'feature-keyword: feature-name\n' + '\n'
        )
      })
    })

    describe('with description', function() {
      beforeEach(function() {
        this.feature.description = 'line1\nline2'
        this.prettyFormatter.handleBeforeFeature(this.feature)
      })

      it('outputs the description below the keyword and name', function() {
        expect(this.output).to.eql(
          'feature-keyword: feature-name\n' +
            '\n' +
            '  line1\n' +
            '  line2\n' +
            '\n'
        )
      })
    })
  })

  describe('before scenario', function() {
    beforeEach(function() {
      this.scenario = {
        keyword: 'scenario-keyword',
        name: 'scenario-name',
        tags: []
      }
    })

    describe('without tags or description', function() {
      beforeEach(function() {
        this.prettyFormatter.handleBeforeScenario(this.scenario)
      })

      it('output the scenario keyword and name', function() {
        expect(this.output).to.eql('  scenario-keyword: scenario-name\n')
      })
    })

    describe('with tags', function() {
      beforeEach(function() {
        this.scenario.tags = [{ name: '@tagA' }, { name: '@tagB' }]
        this.prettyFormatter.handleBeforeScenario(this.scenario)
      })

      it('outputs the tags seperated by spaces above the keyword and name', function() {
        expect(this.output).to.eql(
          '  @tagA @tagB\n' + '  scenario-keyword: scenario-name\n'
        )
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

    describe('failed step', function() {
      beforeEach(function() {
        this.stepResult.status = Status.FAILED
        this.prettyFormatter.handleStepResult(this.stepResult)
      })

      it('logs the keyword and name', function() {
        expect(this.output).to.eql(
          '  ' + figures.cross + ' step-keyword step-name\n'
        )
      })
    })

    describe('passed', function() {
      describe('without name', function() {
        beforeEach(function() {
          delete this.step.name
          this.prettyFormatter.handleStepResult(this.stepResult)
        })

        it('logs the keyword', function() {
          expect(this.output).to.eql('  ' + figures.tick + ' step-keyword \n')
        })
      })

      describe('with name', function() {
        beforeEach(function() {
          this.prettyFormatter.handleStepResult(this.stepResult)
        })

        it('logs the keyword and name', function() {
          expect(this.output).to.eql(
            '  ' + figures.tick + ' step-keyword step-name\n'
          )
        })
      })

      describe('with data table', function() {
        beforeEach(function() {
          const dataTable = Object.create(DataTable.prototype)
          _.assign(
            dataTable,
            createMock({
              raw: [
                ['cuk', 'cuke', 'cukejs'],
                ['c', 'cuke', 'cuke.js'],
                ['cu', 'cuke', 'cucumber']
              ]
            })
          )
          this.step.arguments = [dataTable]
          this.prettyFormatter.handleStepResult(this.stepResult)
        })

        it('logs the keyword and name and data table', function() {
          expect(this.output).to.eql(
            '  ' +
              figures.tick +
              ' step-keyword step-name\n' +
              '      | cuk | cuke | cukejs   |\n' +
              '      | c   | cuke | cuke.js  |\n' +
              '      | cu  | cuke | cucumber |\n'
          )
        })
      })

      describe('with doc string', function() {
        beforeEach(function() {
          const docString = Object.create(DocString.prototype)
          docString.content = 'this is a multiline\ndoc string\n\n:-)'
          this.step.arguments = [docString]
          this.prettyFormatter.handleStepResult(this.stepResult)
        })

        it('logs the keyword and name and doc string', function() {
          expect(this.output).to.eql(
            '  ' +
              figures.tick +
              ' step-keyword step-name\n' +
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

    describe('pending', function() {
      beforeEach(function() {
        this.stepResult.status = Status.PENDING
        this.prettyFormatter.handleStepResult(this.stepResult)
      })

      it('logs the keyword and name', function() {
        expect(this.output).to.eql('  ? step-keyword step-name\n')
      })
    })

    describe('skipped', function() {
      beforeEach(function() {
        this.stepResult.status = Status.SKIPPED
        this.prettyFormatter.handleStepResult(this.stepResult)
      })

      it('logs the keyword and name', function() {
        expect(this.output).to.eql('  - step-keyword step-name\n')
      })
    })

    describe('undefined', function() {
      beforeEach(function() {
        this.stepResult.status = Status.UNDEFINED
        this.prettyFormatter.handleStepResult(this.stepResult)
      })

      it('logs the keyword and name', function() {
        expect(this.output).to.eql('  ? step-keyword step-name\n')
      })
    })
  })

  describe('after scenario', function() {
    beforeEach(function() {
      this.prettyFormatter.handleAfterScenario(this.scenario)
    })

    it('logs a newline', function() {
      expect(this.output).to.eql('\n')
    })
  })
})
