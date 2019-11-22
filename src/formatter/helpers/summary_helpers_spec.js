import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from '../get_color_fns'
import { formatSummary } from './summary_helpers'
import { MILLISECONDS_IN_NANOSECOND } from '../../time'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'

const { Status } = messages.TestResult

describe('SummaryHelpers', () => {
  describe('formatSummary', () => {
    beforeEach(function() {
      this.testCaseAttempts = []
      this.testRun = { duration: 0 }
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
        const testStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: {
            [testStepId]: { status: Status.PASSED },
          },
          testCase: {
            steps: [{ id: testStepId, pickleStepId: uuidv4() }],
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
        const hookTestStepId = uuidv4()
        const pickleTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: {
            [hookTestStepId]: { status: Status.PASSED },
            [pickleTestStepId]: { status: Status.PASSED },
          },
          testCase: {
            steps: [
              { id: hookTestStepId },
              { id: pickleTestStepId, pickleStepId: uuidv4() },
            ],
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
        const testStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.FAILED, willBeRetried: true },
          stepResults: {
            [testStepId]: { status: Status.FAILED },
          },
          testCase: {
            steps: [{ id: testStepId, pickleStepId: uuidv4() }],
          },
        })
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: {
            [testStepId]: { status: Status.PASSED },
          },
          testCase: {
            steps: [{ id: testStepId, pickleStepId: uuidv4() }],
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
        const testStepId1 = uuidv4()
        const testStepId2 = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: {
            [testStepId1]: { status: Status.PASSED },
            [testStepId2]: { status: Status.PASSED },
          },
          testCase: {
            steps: [
              { id: testStepId1, pickleStepId: uuidv4() },
              { id: testStepId2, pickleStepId: uuidv4() },
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
        const ambiguousTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.AMBIGUOUS },
          stepResults: {
            [ambiguousTestStepId]: { status: Status.AMBIGUOUS },
          },
          testCase: {
            steps: [{ id: ambiguousTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const failedTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.FAILED },
          stepResults: {
            [failedTestStepId]: { status: Status.FAILED },
          },
          testCase: {
            steps: [{ id: failedTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const pendingTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.PENDING },
          stepResults: {
            [pendingTestStepId]: { status: Status.PENDING },
          },
          testCase: {
            steps: [{ id: pendingTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const passedTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.PASSED },
          stepResults: {
            [passedTestStepId]: { status: Status.PASSED },
          },
          testCase: {
            steps: [{ id: passedTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const skippedTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.SKIPPED },
          stepResults: {
            [skippedTestStepId]: { status: Status.SKIPPED },
          },
          testCase: {
            steps: [{ id: skippedTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const undefinedTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.UNDEFINED },
          stepResults: {
            [undefinedTestStepId]: { status: Status.UNDEFINED },
          },
          testCase: {
            steps: [{ id: undefinedTestStepId, pickleStepId: uuidv4() }],
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
        this.testRun.duration = 123 * MILLISECONDS_IN_NANOSECOND
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
        this.testRun.duration = 123 * 100 * MILLISECONDS_IN_NANOSECOND
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
        this.testRun.duration = 123 * 1000 * MILLISECONDS_IN_NANOSECOND
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
