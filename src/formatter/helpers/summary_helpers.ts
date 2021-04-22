import _ from 'lodash'
import Duration from 'duration'
import { IColorFns } from '../get_color_fns'
import { ITestCaseAttempt } from './event_data_collector'
import * as messages from '@cucumber/messages'
import { doesHaveValue } from '../../value_checker'

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
  testCaseAttempts.forEach(({ testCase, worstTestStepResult, stepResults }) => {
    Object.values(stepResults).forEach((stepResult) => {
      totalStepDuration = messages.TimeConversion.addDurations(
        totalStepDuration,
        stepResult.duration
      )
    })
    if (!worstTestStepResult.willBeRetried) {
      testCaseResults.push(worstTestStepResult)
      _.each(testCase.testSteps, (testStep) => {
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
  objects: messages.TestStepResult[]
  type: string
}

function getCountSummary({
  colorFns,
  objects,
  type,
}: IGetCountSummaryRequest): string {
  const counts = _.chain(objects).groupBy('status').mapValues('length').value()
  const total = _.chain(counts).values().sum().value()
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
  const duration = new Duration(start, end)
  // Use spaces in toString method for readability and to avoid %Ls which is a format
  return duration.toString('%Ms m %S . %L s').replace(/ /g, '')
}
