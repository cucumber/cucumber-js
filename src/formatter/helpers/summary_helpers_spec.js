import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from '../get_color_fns'
import { formatSummary } from './summary_helpers'
import Status from '../../status'
import { NANOSECONDS_IN_MILLISECOND } from '../../time'
import uuidv4 from 'uuid/v4'

describe('SummaryHelpers', () => {
  describe('formatSummary', () => {
    beforeEach(function() {
      this.testCaseAttempts = []
      this.options = {
        colorFns: getColorFns(false),
        testCaseAttempts: this.testCaseAttempts,
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
          result: { status: Status.PASSED, duration: { seconds: 0, nanos: 0 } },
          stepResults: {
            [testStepId]: { status: Status.PASSED },
          },
          testCase: {
            testSteps: [{ id: testStepId, pickleStepId: uuidv4() }],
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
          result: { status: Status.PASSED, duration: { seconds: 0, nanos: 0 } },
          stepResults: {
            [hookTestStepId]: { status: Status.PASSED },
            [pickleTestStepId]: { status: Status.PASSED },
          },
          testCase: {
            testSteps: [
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
          result: {
            status: Status.FAILED,
            willBeRetried: true,
            duration: { seconds: 0, nanos: 0 },
          },
          stepResults: {
            [testStepId]: { status: Status.FAILED },
          },
          testCase: {
            testSteps: [{ id: testStepId, pickleStepId: uuidv4() }],
          },
        })
        this.testCaseAttempts.push({
          result: { status: Status.PASSED, duration: { seconds: 0, nanos: 0 } },
          stepResults: {
            [testStepId]: {
              status: Status.PASSED,
              duration: { seconds: 0, nanos: 0 },
            },
          },
          testCase: {
            testSteps: [{ id: testStepId, pickleStepId: uuidv4() }],
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
          result: { status: Status.PASSED, duration: { seconds: 0, nanos: 0 } },
          stepResults: {
            [testStepId1]: { status: Status.PASSED },
            [testStepId2]: { status: Status.PASSED },
          },
          testCase: {
            testSteps: [
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
          result: {
            status: Status.AMBIGUOUS,
            duration: { seconds: 0, nanos: 0 },
          },
          stepResults: {
            [ambiguousTestStepId]: { status: Status.AMBIGUOUS },
          },
          testCase: {
            testSteps: [{ id: ambiguousTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const failedTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.FAILED, duration: { seconds: 0, nanos: 0 } },
          stepResults: {
            [failedTestStepId]: { status: Status.FAILED },
          },
          testCase: {
            testSteps: [{ id: failedTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const pendingTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: {
            status: Status.PENDING,
            duration: { seconds: 0, nanos: 0 },
          },
          stepResults: {
            [pendingTestStepId]: { status: Status.PENDING },
          },
          testCase: {
            testSteps: [{ id: pendingTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const passedTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: { status: Status.PASSED, duration: { seconds: 0, nanos: 0 } },
          stepResults: {
            [passedTestStepId]: { status: Status.PASSED },
          },
          testCase: {
            testSteps: [{ id: passedTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const skippedTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: {
            status: Status.SKIPPED,
            duration: { seconds: 0, nanos: 0 },
          },
          stepResults: {
            [skippedTestStepId]: { status: Status.SKIPPED },
          },
          testCase: {
            testSteps: [{ id: skippedTestStepId, pickleStepId: uuidv4() }],
          },
        })
        const undefinedTestStepId = uuidv4()
        this.testCaseAttempts.push({
          result: {
            status: Status.UNDEFINED,
            duration: { seconds: 0, nanos: 0 },
          },
          stepResults: {
            [undefinedTestStepId]: { status: Status.UNDEFINED },
          },
          testCase: {
            testSteps: [{ id: undefinedTestStepId, pickleStepId: uuidv4() }],
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
        const testStepId = uuidv4()
        this.testCaseAttempts.push({
          result: {
            status: Status.PASSED,
            duration: { seconds: 0, nanos: 123 * NANOSECONDS_IN_MILLISECOND },
          },
          stepResults: {
            [testStepId]: { status: Status.PASSED },
          },
          testCase: {
            testSteps: [{ id: testStepId, pickleStepId: uuidv4() }],
          },
        })
        this.result = formatSummary(this.options)
      })

      it('outputs the duration as 0m00.123s', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m00.123s\n'
        )
      })
    })

    describe('with a duration of 12.3 seconds', () => {
      beforeEach(function() {
        const testStepId = uuidv4()
        this.testCaseAttempts.push({
          result: {
            status: Status.PASSED,
            duration: { seconds: 12, nanos: 300 * NANOSECONDS_IN_MILLISECOND },
          },
          stepResults: {
            [testStepId]: { status: Status.PASSED },
          },
          testCase: {
            testSteps: [{ id: testStepId, pickleStepId: uuidv4() }],
          },
        })
        this.result = formatSummary(this.options)
      })

      it('outputs the duration as 0m12.300s', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '0m12.300s\n'
        )
      })
    })

    describe('with a duration of 120.3 seconds', () => {
      beforeEach(function() {
        const testStepId = uuidv4()
        this.testCaseAttempts.push({
          result: {
            status: Status.PASSED,
            duration: { seconds: 123, nanos: 0 },
          },
          stepResults: {
            [testStepId]: { status: Status.PASSED },
          },
          testCase: {
            testSteps: [{ id: testStepId, pickleStepId: uuidv4() }],
          },
        })
        this.result = formatSummary(this.options)
      })

      it('outputs the duration as 2m03.000s', function() {
        expect(this.result).to.contain(
          '1 scenario (1 passed)\n' + '1 step (1 passed)\n' + '2m03.000s\n'
        )
      })
    })
  })
})
