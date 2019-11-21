import _ from 'lodash'
import Duration from 'duration'
import { MILLISECONDS_IN_NANOSECOND } from '../../time'
import { messages } from 'cucumber-messages'

const { Status } = messages.TestResult

const STATUS_REPORT_ORDER = [
  Status.FAILED,
  Status.AMBIGUOUS,
  Status.UNDEFINED,
  Status.PENDING,
  Status.SKIPPED,
  Status.PASSED,
]

export function formatSummary({ colorFns, testCaseAttempts, testRun }) {
  const testCaseResults = []
  const testStepResults = []
  testCaseAttempts.forEach(({ testCase, result, stepResults }) => {
    if (!result.willBeRetried) {
      testCaseResults.push(result)
      _.each(testCase.steps, (testStep) => {
        if (testStep.pickleStepId) {
          testStepResults.push(stepResults[testStep.id])
        }
      })
    }
  })
  const scenarioSummary = getCountSummary({
    colorFns,
    objects: testCaseResults,
    type: 'scenario',
  })
  const stepSummary = getCountSummary({
    colorFns,
    objects: testStepResults,
    type: 'step',
  })
  const durationSummary = getDuration(testRun.duration)
  return [scenarioSummary, stepSummary, durationSummary].join('\n')
}

function getCountSummary({ colorFns, objects, type }) {
  const counts = _.chain(objects)
    .groupBy('status')
    .mapValues('length')
    .value()
  const total = _.reduce(counts, (memo, value) => memo + value) || 0
  let text = `${total} ${type}${total === 1 ? '' : 's'}`
  if (total > 0) {
    const details = []
    STATUS_REPORT_ORDER.forEach(status => {
      if (counts[status] > 0) {
        details.push(colorFns[status](`${counts[status]} ${Status[status].toLowerCase()}`))
      }
    })
    text += ` (${details.join(', ')})`
  }
  return text
}

function getDuration(nanoseconds) {
  const start = new Date(0)
  const end = new Date(nanoseconds / MILLISECONDS_IN_NANOSECOND)
  const duration = new Duration(start, end)

  return (
    `${duration.minutes}m${duration.toString('%S')}.${duration.toString(
      '%L'
    )}s` + `\n`
  )
}
