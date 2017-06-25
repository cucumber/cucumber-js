import getColorFns from '../get_color_fns'
import {formatSummary} from './summary_helpers'
import Status from '../../status'

describe('SummaryHelpers', function() {
  describe('formatSummary', function() {
    beforeEach(function() {
      this.featuresResult = {
        scenarioResults: [],
        stepResults: [],
        duration: 0
      }
      this.options = {
        colorFns: getColorFns(false),
        featuresResult: this.featuresResult
      }
    })

    describe('with no features', function() {
      beforeEach(function() {
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' +
          '0 steps\n' +
          '0m00.000s\n'
        )
      })
    })

    describe('with one passing scenario', function() {
      beforeEach(function() {
        const scenarioResult = {status: Status.PASSED}
        this.featuresResult.scenarioResults = [scenarioResult]
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' +
          '0 steps\n' +
          '0m00.000s\n'
        )
      })
    })

    describe('with one of every kind of scenario', function() {
      beforeEach(function() {
        this.featuresResult.scenarioResults = [
          {status: Status.AMBIGUOUS},
          {status: Status.FAILED},
          {status: Status.PASSED},
          {status: Status.PENDING},
          {status: Status.SKIPPED},
          {status: Status.UNDEFINED}
        ]
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '6 scenarios (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)\n' +
          '0 steps\n' +
          '0m00.000s\n'
        )
      })
    })

    describe('with one passing step', function() {
      beforeEach(function() {
        this.featuresResult.stepResults = [{status: Status.PASSED}]
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' +
          '1 step (1 passed)\n' +
          '0m00.000s\n'
        )
      })
    })

    describe('with one of every kind of step', function() {
      beforeEach(function() {
        this.featuresResult.stepResults = [
          {ambiguousStepDefinitions: [], status: Status.AMBIGUOUS, step: {}},
          {failureException: '', status: Status.FAILED, step: {}},
          {status: Status.PASSED, step: {}},
          {status: Status.PENDING, step: {}},
          {status: Status.SKIPPED, step: {}},
          {status: Status.UNDEFINED, step: {}}
        ]
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' +
          '6 steps (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)\n' +
          '0m00.000s\n'
        )
      })
    })

    describe('with a duration of 123 milliseconds', function() {
      beforeEach(function() {
        this.featuresResult.duration = 123
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' +
          '0 steps\n' +
          '0m00.123s\n'
        )
      })
    })

    describe('with a duration of 12.3 seconds', function() {
      beforeEach(function() {
        this.featuresResult.duration = 123 * 100
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' +
          '0 steps\n' +
          '0m12.300s\n'
        )
      })
    })

    describe('with a duration of 120.3 seconds', function() {
      beforeEach(function() {
        this.featuresResult.duration = 123 * 1000
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' +
          '0 steps\n' +
          '2m03.000s\n'
        )
      })
    })
  })
})
