import _ from 'lodash'
import Duration from 'duration'
import Status from '../../status'

const STATUS_REPORT_ORDER = [
  Status.FAILED,
  Status.AMBIGUOUS,
  Status.UNDEFINED,
  Status.PENDING,
  Status.SKIPPED,
  Status.PASSED
]

export function formatSummary({ colorFns, testCaseMap, testRun }) {
  const testCaseResults = []
  const testStepResults = []
  _.each(testCaseMap, ({ result, steps }) => {
    testCaseResults.push(result)
    _.each(steps, testStep => {
      if (testStep.sourceLocation) {
        testStepResults.push(testStep.result)
      }
    })
  })
  const scenarioSummary = getCountSummary({
    colorFns,
    objects: testCaseResults,
    type: 'scenario'
  })
  const stepSummary = getCountSummary({
    colorFns,
    objects: testStepResults,
    type: 'step'
  })
  const durationSummary = getDuration(testRun.result.duration)
  return [scenarioSummary, stepSummary, durationSummary].join('\n')
}

function getCountSummary({ colorFns, objects, type }) {
  const counts = _.chain(objects)
    .groupBy('status')
    .mapValues('length')
    .value()
  const total = _.reduce(counts, (memo, value) => memo + value) || 0
  let text = total + ' ' + type + (total === 1 ? '' : 's')
  if (total > 0) {
    const details = []
    STATUS_REPORT_ORDER.forEach(status => {
      if (counts[status] > 0) {
        details.push(colorFns[status](counts[status] + ' ' + status))
      }
    })
    text += ' (' + details.join(', ') + ')'
  }
  return text
}

function getDuration(milliseconds) {
  const start = new Date(0)
  const end = new Date(milliseconds)
  const duration = new Duration(start, end)

  return (
    duration.minutes +
    'm' +
    duration.toString('%S') +
    '.' +
    duration.toString('%L') +
    's' +
    '\n'
  )
}
