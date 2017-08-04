import getColorFns from '../get_color_fns'
import { formatSummary } from './summary_helpers'
import Status from '../../status'

describe('SummaryHelpers', function() {
  describe('formatSummary', function() {
    beforeEach(function() {
      this.testCaseMap = {}
      this.testRun = { result: { duration: 0 } }
      this.options = {
        colorFns: getColorFns(false),
        testCaseMap: this.testCaseMap,
        testRun: this.testRun
      }
    })

    describe('with no test cases', function() {
      beforeEach(function() {
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' + '0 steps\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one passing scenario with one passing step', function() {
      beforeEach(function() {
        this.testCaseMap['a.feature:1'] = {
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 2 },
              result: { status: Status.PASSED }
            }
          ],
          result: { status: Status.PASSED }
        }
        this.result = formatSummary(this.options)
      })

      it('outputs the totals and number of each status', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one passing scenario with one step and hook', function() {
      beforeEach(function() {
        this.testCaseMap['a.feature:1'] = {
          steps: [
            { result: { status: Status.PASSED } },
            {
              sourceLocation: { uri: 'a.feature', line: 2 },
              result: { status: Status.PASSED }
            }
          ],
          result: { status: Status.PASSED }
        }
        this.result = formatSummary(this.options)
      })

      it('filter out the hooks', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one passing scenario with multiple passing steps', function() {
      beforeEach(function() {
        this.testCaseMap['a.feature:1'] = {
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 2 },
              result: { status: Status.PASSED }
            },
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
              result: { status: Status.PASSED }
            }
          ],
          result: { status: Status.PASSED }
        }
        this.result = formatSummary(this.options)
      })

      it('outputs the totals and number of each status', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '2 steps (2 passed)\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one of every kind of scenario', function() {
      beforeEach(function() {
        this.testCaseMap['a.feature:1'] = {
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 2 },
              result: { status: Status.AMBIGUOUS }
            }
          ],
          result: { status: Status.AMBIGUOUS }
        }
        this.testCaseMap['a.feature:3'] = {
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 4 },
              result: { status: Status.FAILED }
            }
          ],
          result: { status: Status.FAILED }
        }
        this.testCaseMap['a.feature:5'] = {
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 6 },
              result: { status: Status.PENDING }
            }
          ],
          result: { status: Status.PENDING }
        }
        this.testCaseMap['a.feature:7'] = {
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 8 },
              result: { status: Status.PASSED }
            }
          ],
          result: { status: Status.PASSED }
        }
        this.testCaseMap['a.feature:9'] = {
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 10 },
              result: { status: Status.SKIPPED }
            }
          ],
          result: { status: Status.SKIPPED }
        }
        this.testCaseMap['a.feature:11'] = {
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 12 },
              result: { status: Status.UNDEFINED }
            }
          ],
          result: { status: Status.UNDEFINED }
        }
        this.result = formatSummary(this.options)
      })

      it('outputs the totals and number of each status', function() {
        expect(this.result).to.contain(
          '6 scenarios (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)\n' +
            '6 steps (1 failed, 1 ambiguous, 1 undefined, 1 pending, 1 skipped, 1 passed)\n' +
            '0m00.000s\n'
        )
      })
    })

    describe('with a duration of 123 milliseconds', function() {
      beforeEach(function() {
        this.testRun.result.duration = 123
        this.result = formatSummary(this.options)
      })

      it('outputs the duration as 0m00.123s', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' + '0 steps\n' + '0m00.123s\n'
        )
      })
    })

    describe('with a duration of 12.3 seconds', function() {
      beforeEach(function() {
        this.testRun.result.duration = 123 * 100
        this.result = formatSummary(this.options)
      })

      it('outputs the duration as 0m12.300s', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' + '0 steps\n' + '0m12.300s\n'
        )
      })
    })

    describe('with a duration of 120.3 seconds', function() {
      beforeEach(function() {
        this.testRun.result.duration = 123 * 1000
        this.result = formatSummary(this.options)
      })

      it('outputs the duration as 2m03.000s', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' + '0 steps\n' + '2m03.000s\n'
        )
      })
    })
  })
})
