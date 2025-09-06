import * as messages from '@cucumber/messages'
import { getPickleStepMap } from '../pickle_parser'
import { getGherkinStepMap } from '../gherkin_document_parser'
import StepDefinition from '../../../models/step_definition'
import { doesHaveValue } from '../../../value_checker'
import EventDataCollector from '../event_data_collector'

export interface IUsageMatch {
  duration?: messages.Duration
  line: number
  text: string
  uri: string
}

export interface IUsage {
  code: string
  line: number
  matches: IUsageMatch[]
  meanDuration?: messages.Duration
  pattern: string
  patternType: string
  uri: string
}

export enum UsageOrder {
  EXECUTION_TIME = 'EXECUTION_TIME',
  LOCATION = 'LOCATION',
}

export interface IGetUsageRequest {
  eventDataCollector: EventDataCollector
  stepDefinitions: StepDefinition[]
  order?: UsageOrder
}

function buildEmptyMapping(
  stepDefinitions: StepDefinition[]
): Record<string, IUsage> {
  const mapping: Record<string, IUsage> = {}
  stepDefinitions.forEach((stepDefinition) => {
    mapping[stepDefinition.id] = {
      code: stepDefinition.unwrappedCode.toString(),
      line: stepDefinition.line,
      pattern: stepDefinition.expression.source,
      patternType: stepDefinition.expression.constructor.name,
      matches: [],
      uri: stepDefinition.uri,
    }
  })
  return mapping
}

const unexecutedStatuses: readonly messages.TestStepResultStatus[] = [
  messages.TestStepResultStatus.AMBIGUOUS,
  messages.TestStepResultStatus.SKIPPED,
  messages.TestStepResultStatus.UNDEFINED,
]

function buildMapping({
  stepDefinitions,
  eventDataCollector,
}: Omit<IGetUsageRequest, 'order'>): Record<string, IUsage> {
  const mapping = buildEmptyMapping(stepDefinitions)
  eventDataCollector.getTestCaseAttempts().forEach((testCaseAttempt) => {
    const pickleStepMap = getPickleStepMap(testCaseAttempt.pickle)
    const gherkinStepMap = getGherkinStepMap(testCaseAttempt.gherkinDocument)
    testCaseAttempt.testCase.testSteps.forEach((testStep) => {
      if (
        doesHaveValue(testStep.pickleStepId) &&
        testStep.stepDefinitionIds.length === 1
      ) {
        const stepDefinitionId = testStep.stepDefinitionIds[0]
        const pickleStep = pickleStepMap[testStep.pickleStepId]
        const gherkinStep = gherkinStepMap[pickleStep.astNodeIds[0]]
        const match: IUsageMatch = {
          line: gherkinStep.location.line,
          text: pickleStep.text,
          uri: testCaseAttempt.pickle.uri,
        }
        const { duration, status } = testCaseAttempt.stepResults[testStep.id]
        if (!unexecutedStatuses.includes(status) && doesHaveValue(duration)) {
          match.duration = duration
        }
        if (doesHaveValue(mapping[stepDefinitionId])) {
          mapping[stepDefinitionId].matches.push(match)
        }
      }
    })
  })
  return mapping
}

function normalizeDuration(duration?: messages.Duration): number {
  if (duration == null) {
    return Number.MIN_SAFE_INTEGER
  }
  return messages.TimeConversion.durationToMilliseconds(duration)
}

function buildResult(
  mapping: Record<string, IUsage>,
  order: UsageOrder
): IUsage[] {
  return Object.keys(mapping)
    .map((stepDefinitionId) => {
      const { matches, ...rest } = mapping[stepDefinitionId]
      const sortedMatches = matches.sort((a: IUsageMatch, b: IUsageMatch) => {
        if (a.duration === b.duration) {
          return a.text < b.text ? -1 : 1
        }
        if (order === UsageOrder.EXECUTION_TIME) {
          return normalizeDuration(b.duration) - normalizeDuration(a.duration)
        } else {
          return a.text.localeCompare(b.text)
        }
      })
      const result = { matches: sortedMatches, ...rest }
      const durations: messages.Duration[] = matches
        .filter((m) => m.duration != null)
        .map((m) => m.duration)
      if (durations.length > 0) {
        const totalMilliseconds = durations.reduce(
          (acc, x) => acc + messages.TimeConversion.durationToMilliseconds(x),
          0
        )
        result.meanDuration = messages.TimeConversion.millisecondsToDuration(
          totalMilliseconds / durations.length
        )
      }
      return result
    })
    .sort((a: IUsage, b: IUsage) => {
      if (order === UsageOrder.EXECUTION_TIME) {
        return (
          normalizeDuration(b.meanDuration) - normalizeDuration(a.meanDuration)
        )
      } else {
        return a.uri.localeCompare(b.uri)
      }
    })
}

export function getUsage({
  stepDefinitions,
  eventDataCollector,
  order = UsageOrder.EXECUTION_TIME,
}: IGetUsageRequest): IUsage[] {
  const mapping = buildMapping({ stepDefinitions, eventDataCollector })
  return buildResult(mapping, order)
}
