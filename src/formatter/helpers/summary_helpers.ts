import _ from 'lodash'
import Duration from 'duration'
import Status from '../../status'
import {
  addDurations,
  durationToMilliseconds,
  getZeroDuration,
} from '../../time'
import { IColorFns } from '../get_color_fns'
import { ITestCaseAttempt } from './event_data_collector'
import { messages } from '@cucumber/messages'

const STATUS_REPORT_ORDER = [
  Status.FAILED,
  Status.AMBIGUOUS,
  Status.UNDEFINED,
  Status.PENDING,
  Status.SKIPPED,
  Status.PASSED,
]

export interface IFormatSummaryRequest {
  colorFns: IColorFns
  testCaseAttempts: ITestCaseAttempt[]
}

export function formatSummary({
  colorFns,
  testCaseAttempts,
}: IFormatSummaryRequest): string {
  const testCaseResults: messages.TestStepFinished.ITestStepResult[] = []
  const testStepResults: messages.TestStepFinished.ITestStepResult[] = []
  let totalDuration = getZeroDuration()
  testCaseAttempts.forEach(({ testCase, result, stepResults }) => {
    totalDuration = addDurations(totalDuration, result.duration)
    if (!result.willBeRetried) {
      testCaseResults.push(result)
      _.each(testCase.testSteps, (testStep) => {
        if (testStep.pickleStepId !== '') {
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
  const durationSummary = getDurationSummary(totalDuration)
  return [scenarioSummary, stepSummary, durationSummary].join('\n')
}

interface IGetCountSummaryRequest {
  colorFns: IColorFns
  objects: messages.TestStepFinished.ITestStepResult[]
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
            `${counts[status].toString()} ${Status[status].toLowerCase()}`
          )
        )
      }
    })
    text += ` (${details.join(', ')})`
  }
  return text
}

function getDurationSummary(durationMsg: messages.IDuration): string {
  const start = new Date(0)
  const end = new Date(durationToMilliseconds(durationMsg))
  const duration = new Duration(start, end)
  // Use spaces in toString method for readability and to avoid %Ls which is a format
  return duration.toString('%Ms m %S . %L s').replace(/ /g, '') + '\n'
}
