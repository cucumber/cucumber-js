import {
  type Duration,
  type TestStepResult,
  TestStepResultStatus,
  TimeConversion,
} from '@cucumber/messages'
import { Interval } from 'luxon'
import { doesHaveValue } from '../../value_checker'
import type { IColorFns } from '../get_color_fns'
import type { ITestCaseAttempt } from './event_data_collector'

const STATUS_REPORT_ORDER = [
  TestStepResultStatus.FAILED,
  TestStepResultStatus.AMBIGUOUS,
  TestStepResultStatus.UNDEFINED,
  TestStepResultStatus.PENDING,
  TestStepResultStatus.SKIPPED,
  TestStepResultStatus.PASSED,
  TestStepResultStatus.UNKNOWN,
]

export interface IFormatSummaryRequest {
  colorFns: IColorFns
  testCaseAttempts: ITestCaseAttempt[]
  testRunDuration: Duration
}

export function formatSummary({
  colorFns,
  testCaseAttempts,
  testRunDuration,
}: IFormatSummaryRequest): string {
  const testCaseResults: TestStepResult[] = []
  const testStepResults: TestStepResult[] = []
  let totalStepDuration = TimeConversion.millisecondsToDuration(0)
  testCaseAttempts.forEach(({ testCase, willBeRetried, worstTestStepResult, stepResults }) => {
    Object.values(stepResults).forEach((stepResult) => {
      totalStepDuration = TimeConversion.addDurations(totalStepDuration, stepResult.duration)
    })
    if (!willBeRetried) {
      testCaseResults.push(worstTestStepResult)
      testCase.testSteps.forEach((testStep) => {
        if (doesHaveValue(testStep.pickleStepId)) {
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
  const durationSummary = `${getDurationSummary(
    testRunDuration
  )} (executing steps: ${getDurationSummary(totalStepDuration)})\n`
  return [scenarioSummary, stepSummary, durationSummary].join('\n')
}

interface IGetCountSummaryRequest {
  colorFns: IColorFns
  objects: TestStepResult[]
  type: string
}

function getCountSummary({ colorFns, objects, type }: IGetCountSummaryRequest): string {
  const counts: Record<string, number> = {}
  for (const x of STATUS_REPORT_ORDER) {
    counts[x] = 0
  }
  for (const x of objects) {
    counts[x.status] += 1
  }
  const total = Object.values(counts).reduce((acc, x) => acc + x, 0)
  let text = `${total.toString()} ${type}${total === 1 ? '' : 's'}`
  if (total > 0) {
    const details: string[] = []
    STATUS_REPORT_ORDER.forEach((status) => {
      if (counts[status] > 0) {
        details.push(
          colorFns.forStatus(status)(`${counts[status].toString()} ${status.toLowerCase()}`)
        )
      }
    })
    text += ` (${details.join(', ')})`
  }
  return text
}

function getDurationSummary(durationMsg: Duration): string {
  const start = new Date(0)
  const end = new Date(TimeConversion.durationToMilliseconds(durationMsg))
  const duration = Interval.fromDateTimes(start, end).toDuration([
    'minutes',
    'seconds',
    'milliseconds',
  ])
  return duration.toFormat("m'm'ss.SSS's'")
}
