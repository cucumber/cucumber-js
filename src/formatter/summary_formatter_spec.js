import getColorFns from './get_color_fns'
import Status from '../status'
import SummaryFormatter from './summary_formatter'
import figures from 'figures'

describe('SummaryFormatter', function() {
  beforeEach(function() {
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    this.scenario = {
      line: 1,
      name: 'name1',
      uri: 'a.feature'
    }
    this.step = {
      arguments: [],
      keyword: 'keyword ',
      line: 2,
      name: 'name2',
      uri: 'a.feature'
    }
    this.featuresResult = {
      scenarioResults: [],
      stepResults: [],
      duration: 0
    }
    const snippetBuilder = createMock({ build: 'snippet' })
    this.summaryFormatter = new SummaryFormatter({
      colorFns: getColorFns(false),
      log: logFn,
      snippetBuilder
    })
  })

  describe('issues', function() {
    beforeEach(function() {})

    describe('with a failing scenario', function() {
      beforeEach(function() {
        const scenarioResult = {
          status: Status.FAILED,
          scenario: this.scenario,
          stepResults: [
            {
              duration: 0,
              failureException: 'error',
              status: Status.FAILED,
              step: this.step,
              stepDefinition: {
                line: 3,
                uri: 'steps.js'
              }
            }
          ]
        }
        this.featuresResult.scenarioResults = [scenarioResult]
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('logs the issue', function() {
        expect(this.output).to.contain(
          'Failures:\n' +
            '\n' +
            '1) Scenario: name1 # a.feature:1\n' +
            '   ' +
            figures.cross +
            ' keyword name2 # steps.js:3\n' +
            '       error'
        )
      })
    })

    describe('with an ambiguous step', function() {
      beforeEach(function() {
        const stepDefinition1 = {
          line: 3,
          pattern: 'pattern1',
          uri: 'steps.js'
        }
        const stepDefinition2 = {
          line: 4,
          pattern: 'longer pattern2',
          uri: 'steps.js'
        }
        const scenarioResult = {
          status: Status.FAILED,
          scenario: this.scenario,
          stepResults: [
            {
              ambiguousStepDefinitions: [stepDefinition1, stepDefinition2],
              duration: 0,
              status: Status.AMBIGUOUS,
              step: this.step
            }
          ]
        }
        this.featuresResult.scenarioResults = [scenarioResult]
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('logs the issue', function() {
        expect(this.output).to.contain(
          'Failures:\n' +
            '\n' +
            '1) Scenario: name1 # a.feature:1\n' +
            '   ' +
            figures.cross +
            ' keyword name2\n' +
            '       Multiple step definitions match:\n' +
            '         pattern1        - steps.js:3\n' +
            '         longer pattern2 - steps.js:4'
        )
      })
    })

    describe('with an undefined step', function() {
      beforeEach(function() {
        const scenarioResult = {
          status: Status.UNDEFINED,
          scenario: this.scenario,
          stepResults: [
            {
              duration: 0,
              status: Status.UNDEFINED,
              step: this.step
            }
          ]
        }
        this.featuresResult.scenarioResults = [scenarioResult]
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('logs the issue', function() {
        expect(this.output).to.contain(
          'Warnings:\n' +
            '\n' +
            '1) Scenario: name1 # a.feature:1\n' +
            '   ? keyword name2\n' +
            '       Undefined. Implement with the following snippet:\n' +
            '\n' +
            '         snippet\n' +
            '\n'
        )
      })
    })

    describe('with a pending step', function() {
      beforeEach(function() {
        const scenarioResult = {
          status: Status.PENDING,
          scenario: this.scenario,
          stepResults: [
            {
              duration: 0,
              status: Status.PENDING,
              step: this.step
            }
          ]
        }
        this.featuresResult.scenarioResults = [scenarioResult]
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('logs the issue', function() {
        expect(this.output).to.contain(
          'Warnings:\n' +
            '\n' +
            '1) Scenario: name1 # a.feature:1\n' +
            '   ? keyword name2\n' +
            '       Pending'
        )
      })
    })
  })

  describe('summary', function() {
    describe('with no features', function() {
      beforeEach(function() {
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.output).to.contain(
          '0 scenarios\n' + '0 steps\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one passing scenario', function() {
      beforeEach(function() {
        const scenarioResult = {
          scenario: this.scenario,
          status: Status.PASSED
        }
        this.featuresResult.scenarioResults = [scenarioResult]
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.output).to.contain(
          '1 scenario (1 passed)\n' + '0 steps\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one of every kind of scenario', function() {
      beforeEach(function() {
        this.featuresResult.scenarioResults = [
          { scenario: this.scenario, status: Status.AMBIGUOUS },
          { scenario: this.scenario, status: Status.FAILED },
          { scenario: this.scenario, status: Status.PASSED },
          { scenario: this.scenario, status: Status.PENDING },
          { scenario: this.scenario, status: Status.SKIPPED },
          { scenario: this.scenario, status: Status.UNDEFINED }
        ]
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.output).to.contain(
          '6 scenarios (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)\n' +
            '0 steps\n' +
            '0m00.000s\n'
        )
      })
    })

    describe('with one passing step', function() {
      beforeEach(function() {
        this.featuresResult.stepResults = [{ status: Status.PASSED }]
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.output).to.contain(
          '0 scenarios\n' + '1 step (1 passed)\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one of every kind of step', function() {
      beforeEach(function() {
        this.featuresResult.stepResults = [
          { ambiguousStepDefinitions: [], status: Status.AMBIGUOUS, step: {} },
          { failureException: '', status: Status.FAILED, step: {} },
          { status: Status.PASSED, step: {} },
          { status: Status.PENDING, step: {} },
          { status: Status.SKIPPED, step: {} },
          { status: Status.UNDEFINED, step: {} }
        ]
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.output).to.contain(
          '0 scenarios\n' +
            '6 steps (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)\n' +
            '0m00.000s\n'
        )
      })
    })

    describe('with a duration of 123 milliseconds', function() {
      beforeEach(function() {
        this.featuresResult.duration = 123
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.output).to.contain(
          '0 scenarios\n' + '0 steps\n' + '0m00.123s\n'
        )
      })
    })

    describe('with a duration of 12.3 seconds', function() {
      beforeEach(function() {
        this.featuresResult.duration = 123 * 100
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.output).to.contain(
          '0 scenarios\n' + '0 steps\n' + '0m12.300s\n'
        )
      })
    })

    describe('with a duration of 120.3 seconds', function() {
      beforeEach(function() {
        this.featuresResult.duration = 123 * 1000
        this.summaryFormatter.handleFeaturesResult(this.featuresResult)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.output).to.contain(
          '0 scenarios\n' + '0 steps\n' + '2m03.000s\n'
        )
      })
    })
  })
})
