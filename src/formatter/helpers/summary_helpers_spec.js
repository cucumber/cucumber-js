import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from '../get_color_fns'
import { formatSummary } from './summary_helpers'
import Status from '../../status'

describe('SummaryHelpers', () => {
  describe('formatSummary', () => {
    beforeEach(function() {
      this.testCaseAttempts = []
      this.testRun = { result: { duration: 0 } }
      this.options = {
        colorFns: getColorFns(false),
        testCaseAttempts: this.testCaseAttempts,
        testRun: this.testRun,
      }
    })

    describe('with no test cases', () => {
      beforeEach(function() {
        this.result = formatSummary(this.options)
      })

      it('outputs step totals, scenario totals, and duration', function() {
        expect(this.result).to.contain(
          '0 scenarios\n' + '0 steps\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one passing scenario with one passing step', () => {
      beforeEach(function() {
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: [{ status: Status.PASSED }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 2 } }],
          },
        })
        this.result = formatSummary(this.options)
      })

      it('outputs the totals and number of each status', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one passing scenario with one step and hook', () => {
      beforeEach(function() {
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: [{ status: Status.PASSED }, { status: Status.PASSED }],
          testCase: {
            steps: [{}, { sourceLocation: { uri: 'a.feature', line: 2 } }],
          },
        })
        this.result = formatSummary(this.options)
      })

      it('filter out the hooks', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one scenario that failed and was retried then passed', () => {
      beforeEach(function() {
        this.testCaseAttempts.push({
          result: { status: Status.FAILED, retried: true },
          stepResults: [{ status: Status.FAILED }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 2 } }],
          },
        })
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: [{ status: Status.PASSED }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 2 } }],
          },
        })
        this.result = formatSummary(this.options)
      })

      it('filters out the retried attempts', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one passing scenario with multiple passing steps', () => {
      beforeEach(function() {
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: [{ status: Status.PASSED }, { status: Status.PASSED }],
          testCase: {
            steps: [
              { sourceLocation: { uri: 'a.feature', line: 2 } },
              { sourceLocation: { uri: 'a.feature', line: 3 } },
            ],
          },
        })
        this.result = formatSummary(this.options)
      })

      it('outputs the totals and number of each status', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '2 steps (2 passed)\n' + '0m00.000s\n'
        )
      })
    })

    describe('with one of every kind of scenario', () => {
      beforeEach(function() {
        this.testCaseAttempts.push({
          result: { status: Status.AMBIGUOUS },
          stepResults: [{ status: Status.AMBIGUOUS }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 2 } }],
          },
        })
        this.testCaseAttempts.push({
          result: { status: Status.FAILED },
          stepResults: [{ status: Status.FAILED }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 4 } }],
          },
        })
        this.testCaseAttempts.push({
          result: { status: Status.PENDING },
          stepResults: [{ status: Status.PENDING }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 6 } }],
          },
        })
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: [{ status: Status.PASSED }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 8 } }],
          },
        })
        this.testCaseAttempts.push({
          result: { status: Status.SKIPPED },
          stepResults: [{ status: Status.SKIPPED }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 10 } }],
          },
        })
        this.testCaseAttempts.push({
          result: { status: Status.UNDEFINED },
          stepResults: [{ status: Status.UNDEFINED }],
          testCase: {
            steps: [{ sourceLocation: { uri: 'a.feature', line: 12 } }],
          },
        })
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

    describe('with a duration of 123 milliseconds', () => {
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

    describe('with a duration of 12.3 seconds', () => {
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

    describe('with a duration of 120.3 seconds', () => {
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
