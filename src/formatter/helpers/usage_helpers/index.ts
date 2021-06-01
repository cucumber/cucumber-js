import _ from 'lodash'
import { getPickleStepMap } from '../pickle_parser'
import { getGherkinStepMap } from '../gherkin_document_parser'
import * as messages from '@cucumber/messages'
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

export interface IGetUsageRequest {
  cwd: string
  eventDataCollector: EventDataCollector
  stepDefinitions: StepDefinition[]
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
  cwd,
  stepDefinitions,
  eventDataCollector,
}: IGetUsageRequest): Record<string, IUsage> {
  const mapping = buildEmptyMapping(stepDefinitions)
  _.each(eventDataCollector.getTestCaseAttempts(), (testCaseAttempt) => {
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

function invertDuration(duration: messages.Duration): number {
  if (doesHaveValue(duration)) {
    return -1 * messages.TimeConversion.durationToMilliseconds(duration)
  }
  return 1
}

function buildResult(mapping: Record<string, IUsage>): IUsage[] {
  return _.chain(mapping)
    .map(({ matches, ...rest }: IUsage) => {
      const sortedMatches = _.sortBy(matches, [
        (match: IUsageMatch) => invertDuration(match.duration),
        'text',
      ])
      const result = { matches: sortedMatches, ...rest }
      const durations: messages.Duration[] = _.chain(matches)
        .map((m: IUsageMatch) => m.duration)
        .compact()
        .value()
      if (durations.length > 0) {
        result.meanDuration = messages.TimeConversion.millisecondsToDuration(
          _.meanBy(durations, (d: messages.Duration) =>
            messages.TimeConversion.durationToMilliseconds(d)
          )
        )
      }
      return result
    })
    .sortBy((usage: IUsage) => invertDuration(usage.meanDuration))
    .value()
}

export function getUsage({
  cwd,
  stepDefinitions,
  eventDataCollector,
}: IGetUsageRequest): IUsage[] {
  const mapping = buildMapping({ cwd, stepDefinitions, eventDataCollector })
  return buildResult(mapping)
}
