import getColorFns from '../get_color_fns'
import Status from '../../status'
import { formatIssue } from './issue_helpers'
import DataTable from '../../models/step_arguments/data_table'
import DocString from '../../models/step_arguments/doc_string'
import _ from 'lodash'
import figures from 'figures'

describe('IssueHelpers', function() {
  beforeEach(function() {
    this.options = {
      colorFns: getColorFns(false),
      number: 1,
      snippetBuilder: createMock({ build: 'snippet' })
    }
    this.passedStepResult = {
      duration: 0,
      status: Status.PASSED,
      step: {
        arguments: [],
        keyword: 'keyword1 ',
        name: 'name1'
      },
      stepDefinition: {
        line: 2,
        uri: 'steps.js'
      }
    }
    this.skippedStepResult = {
      duration: 0,
      status: Status.SKIPPED,
      step: {
        arguments: [],
        keyword: 'keyword3 ',
        name: 'name3'
      },
      stepDefinition: {
        line: 4,
        uri: 'steps.js'
      }
    }
  })

  describe('formatIssue', function() {
    describe('with a failing step', function() {
      beforeEach(function() {
        const stepResults = [
          this.passedStepResult,
          {
            duration: 0,
            failureException: 'error',
            status: Status.FAILED,
            step: {
              arguments: [],
              keyword: 'keyword2 ',
              name: 'name2'
            },
            stepDefinition: {
              line: 3,
              uri: 'steps.js'
            }
          },
          this.skippedStepResult
        ]
        const scenario = {
          line: 1,
          name: 'name1',
          uri: 'a.feature'
        }
        this.options.scenarioResult = {
          scenario,
          stepResults
        }
        this.result = formatIssue(this.options)
      })

      it('prints the scenario', function() {
        expect(this.result).to.eql(
          '1) Scenario: name1 # a.feature:1\n' +
            '   ' +
            figures.tick +
            ' keyword1 name1 # steps.js:2\n' +
            '   ' +
            figures.cross +
            ' keyword2 name2 # steps.js:3\n' +
            '       error\n' +
            '   - keyword3 name3 # steps.js:4\n\n'
        )
      })
    })

    describe('with an ambiguous step', function() {
      beforeEach(function() {
        const stepResults = [
          this.passedStepResult,
          {
            ambiguousStepDefinitions: [
              {
                line: 5,
                pattern: 'pattern1',
                uri: 'steps.js'
              },
              {
                line: 6,
                pattern: 'longer pattern2',
                uri: 'steps.js'
              }
            ],
            duration: 0,
            status: Status.AMBIGUOUS,
            step: {
              arguments: [],
              keyword: 'keyword2 ',
              name: 'name2'
            }
          },
          this.skippedStepResult
        ]
        const scenario = {
          line: 1,
          name: 'name1',
          uri: 'a.feature'
        }
        this.options.scenarioResult = {
          scenario,
          stepResults
        }
        this.result = formatIssue(this.options)
      })

      it('logs the issue', function() {
        expect(this.result).to.eql(
          '1) Scenario: name1 # a.feature:1\n' +
            '   ' +
            figures.tick +
            ' keyword1 name1 # steps.js:2\n' +
            '   ' +
            figures.cross +
            ' keyword2 name2\n' +
            '       Multiple step definitions match:\n' +
            '         pattern1        - steps.js:5\n' +
            '         longer pattern2 - steps.js:6\n' +
            '   - keyword3 name3 # steps.js:4\n\n'
        )
      })
    })

    describe('with an undefined step', function() {
      beforeEach(function() {
        const stepResults = [
          this.passedStepResult,
          {
            duration: 0,
            status: Status.UNDEFINED,
            step: {
              arguments: [],
              keyword: 'keyword2 ',
              name: 'name2'
            }
          },
          this.skippedStepResult
        ]
        const scenario = {
          line: 1,
          name: 'name1',
          uri: 'a.feature'
        }
        this.options.scenarioResult = {
          scenario,
          stepResults
        }
        this.result = formatIssue(this.options)
      })

      it('logs the issue', function() {
        expect(this.result).to.eql(
          '1) Scenario: name1 # a.feature:1\n' +
            '   ' +
            figures.tick +
            ' keyword1 name1 # steps.js:2\n' +
            '   ? keyword2 name2\n' +
            '       Undefined. Implement with the following snippet:\n' +
            '\n' +
            '         snippet\n' +
            '\n' +
            '   - keyword3 name3 # steps.js:4\n\n'
        )
      })
    })

    describe('with a pending step', function() {
      beforeEach(function() {
        const stepResults = [
          this.passedStepResult,
          {
            duration: 0,
            status: Status.PENDING,
            step: {
              arguments: [],
              keyword: 'keyword2 ',
              name: 'name2'
            }
          },
          this.skippedStepResult
        ]
        const scenario = {
          line: 1,
          name: 'name1',
          uri: 'a.feature'
        }
        this.options.scenarioResult = {
          scenario,
          stepResults
        }
        this.result = formatIssue(this.options)
      })

      it('logs the issue', function() {
        expect(this.result).to.eql(
          '1) Scenario: name1 # a.feature:1\n' +
            '   ' +
            figures.tick +
            ' keyword1 name1 # steps.js:2\n' +
            '   ? keyword2 name2\n' +
            '       Pending\n' +
            '   - keyword3 name3 # steps.js:4\n\n'
        )
      })
    })

    describe('step with data table', function() {
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
        const stepResults = [
          {
            duration: 0,
            status: Status.PASSED,
            step: {
              arguments: [dataTable],
              keyword: 'keyword ',
              name: 'name'
            }
          }
        ]
        const scenario = {
          line: 1,
          name: 'name1',
          uri: 'a.feature'
        }
        this.options.scenarioResult = {
          scenario,
          stepResults
        }
        this.result = formatIssue(this.options)
      })

      it('logs the keyword and name and data table', function() {
        expect(this.result).to.eql(
          '1) Scenario: name1 # a.feature:1\n' +
            '   ' +
            figures.tick +
            ' keyword name\n' +
            '       | cuk | cuke | cukejs   |\n' +
            '       | c   | cuke | cuke.js  |\n' +
            '       | cu  | cuke | cucumber |\n' +
            '\n'
        )
      })
    })

    describe('step with doc string', function() {
      beforeEach(function() {
        const docString = Object.create(DocString.prototype)
        docString.content = 'this is a multiline\ndoc string\n\n:-)'
        const stepResults = [
          {
            duration: 0,
            status: Status.PASSED,
            step: {
              arguments: [docString],
              keyword: 'keyword ',
              name: 'name'
            }
          }
        ]
        const scenario = {
          line: 1,
          name: 'name1',
          uri: 'a.feature'
        }
        this.options.scenarioResult = {
          scenario,
          stepResults
        }
        this.result = formatIssue(this.options)
      })

      it('logs the keyword and name and doc string', function() {
        expect(this.result).to.eql(
          '1) Scenario: name1 # a.feature:1\n' +
            '   ' +
            figures.tick +
            ' keyword name\n' +
            '       """\n' +
            '       this is a multiline\n' +
            '       doc string\n' +
            '\n' +
            '       :-)\n' +
            '       """\n' +
            '\n'
        )
      })
    })
  })
})
