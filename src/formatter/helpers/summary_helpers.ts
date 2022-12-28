import { IColorFns } from '../get_color_fns'
import { ITestCaseAttempt } from './event_data_collector'
import * as messages from '@cucumber/messages'
import { doesHaveValue } from '../../value_checker'
import { Interval } from 'luxon'

const STATUS_REPORT_ORDER = [
  messages.TestStepResultStatus.FAILED,
  messages.TestStepResultStatus.AMBIGUOUS,
  messages.TestStepResultStatus.UNDEFINED,
  messages.TestStepResultStatus.PENDING,
  messages.TestStepResultStatus.SKIPPED,
  messages.TestStepResultStatus.PASSED,
]

export interface IFormatSummaryRequest {
  colorFns: IColorFns
  testCaseAttempts: ITestCaseAttempt[]
  testRunDuration: messages.Duration
}

export function formatSummary({
  colorFns,
  testCaseAttempts,
  testRunDuration,
}: IFormatSummaryRequest): string {
  const testCaseResults: messages.TestStepResult[] = []
  const testStepResults: messages.TestStepResult[] = []
  let totalStepDuration = messages.TimeConversion.millisecondsToDuration(0)
  testCaseAttempts.forEach(
    ({ testCase, willBeRetried, worstTestStepResult, stepResults }) => {
      Object.values(stepResults).forEach((stepResult) => {
        totalStepDuration = messages.TimeConversion.addDurations(
          totalStepDuration,
          stepResult.duration
        )
      })
      if (!willBeRetried) {
        testCaseResults.push(worstTestStepResult)
        testCase.testSteps.forEach((testStep) => {
          if (doesHaveValue(testStep.pickleStepId)) {
            testStepResults.push(stepResults[testStep.id])
          }
        })
      }
    }
  )
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
  const durationSummary = `${getDurationSummary(
    testRunDuration
  )} (executing steps: ${getDurationSummary(totalStepDuration)})\n`
  return [scenarioSummary, stepSummary, durationSummary].join('\n')
}

interface IGetCountSummaryRequest {
  colorFns: IColorFns
  objects: messages.TestStepResult[]
  type: string
}

function getCountSummary({
  colorFns,
  objects,
  type,
}: IGetCountSummaryRequest): string {
  const counts: Record<string, number> = {}
  STATUS_REPORT_ORDER.forEach((x) => (counts[x] = 0))
  objects.forEach((x) => (counts[x.status] += 1))
  const total = Object.values(counts).reduce((acc, x) => acc + x, 0)
  let text = `${total.toString()} ${type}${total === 1 ? '' : 's'}`
  if (total > 0) {
    const details: string[] = []
    STATUS_REPORT_ORDER.forEach((status) => {
      if (counts[status] > 0) {
        details.push(
          colorFns.forStatus(status)(
            `${counts[status].toString()} ${status.toLowerCase()}`
          )
        )
      }
    })
    text += ` (${details.join(', ')})`
  }
  return text
}

function getDurationSummary(durationMsg: messages.Duration): string {
  const start = new Date(0)
  const end = new Date(
    messages.TimeConversion.durationToMilliseconds(durationMsg)
  )
  const duration = Interval.fromDateTimes(start, end).toDuration([
    'minutes',
    'seconds',
    'milliseconds',
  ])
  return duration.toFormat("m'm'ss.SSS's'")
}
