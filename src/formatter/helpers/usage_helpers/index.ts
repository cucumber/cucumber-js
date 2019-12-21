import _, { Dictionary } from 'lodash'
import { getPickleStepMap } from '../pickle_parser'
import path from 'path'
import { getGherkinStepMap } from '../gherkin_document_parser'
import { durationToMilliseconds, millisecondsToDuration } from '../../../time'
import { messages } from 'cucumber-messages'
import StepDefinition from '../../../models/step_definition'

export interface IUsageMatch {
  duration?: messages.IDuration
  line: number
  text: string
  uri: string
}

export interface IUsage {
  code: string
  line: number
  matches: IUsageMatch[]
  meanDuration?: messages.IDuration
  pattern: string
  patternType: string
  uri: string
}

function getCodeAsString(stepDefinition) {
  if (typeof stepDefinition.unwrappedCode === 'function') {
    return stepDefinition.unwrappedCode.toString()
  }
  return stepDefinition.code.toString()
}

function buildEmptyMapping(
  stepDefinitions: StepDefinition[]
): Dictionary<IUsage> {
  const mapping = {}
  stepDefinitions.forEach(stepDefinition => {
    mapping[stepDefinition.id] = {
      code: getCodeAsString(stepDefinition),
      line: stepDefinition.line,
      pattern: stepDefinition.expression.source,
      patternType: stepDefinition.expression.constructor.name,
      matches: [],
      uri: stepDefinition.uri,
    }
  })
  return mapping
}

function buildMapping({
  cwd,
  stepDefinitions,
  eventDataCollector,
}): Dictionary<IUsage> {
  const mapping = buildEmptyMapping(stepDefinitions)
  _.each(eventDataCollector.getTestCaseAttempts(), testCaseAttempt => {
    const pickleStepMap = getPickleStepMap(testCaseAttempt.pickle)
    const gherkinStepMap = getGherkinStepMap(testCaseAttempt.gherkinDocument)
    testCaseAttempt.testCase.testSteps.forEach(testStep => {
      if (testStep.pickleStepId && testStep.stepDefinitionIds.length === 1) {
        const stepDefinitionId = testStep.stepDefinitionIds[0]
        const pickleStep = pickleStepMap[testStep.pickleStepId]
        const gherkinStep = gherkinStepMap[pickleStep.astNodeIds[0]]
        const match: IUsageMatch = {
          line: gherkinStep.location.line,
          text: pickleStep.text,
          uri: path.relative(cwd, testCaseAttempt.pickle.uri),
        }
        const { duration } = testCaseAttempt.stepResults[testStep.id]
        if (duration) {
          match.duration = duration
        }
        if (mapping[stepDefinitionId]) {
          mapping[stepDefinitionId].matches.push(match)
        }
      }
    })
  })
  return mapping
}

function invertNumber(key: string): (obj: any) => number {
  return obj => {
    const value = obj[key]
    if (value) {
      return -1 * durationToMilliseconds(value)
    }
    return 1
  }
}

function buildResult(mapping: Dictionary<IUsage>): IUsage[] {
  return _.chain(mapping)
    .map(({ matches, ...rest }: IUsage) => {
      const sortedMatches = _.sortBy(matches, [
        invertNumber('duration'),
        'text',
      ])
      const result = { matches: sortedMatches, ...rest }
      const durations: messages.IDuration[] = _.chain(matches)
        .map((m: IUsageMatch) => m.duration)
        .compact()
        .value()
      if (durations.length > 0) {
        result.meanDuration = millisecondsToDuration(
          _.meanBy(durations, (d: messages.IDuration) =>
            durationToMilliseconds(d)
          )
        )
      }
      return result
    })
    .sortBy(invertNumber('meanDuration'))
    .value()
}

export function getUsage({ cwd, stepDefinitions, eventDataCollector }) {
  const mapping = buildMapping({ cwd, stepDefinitions, eventDataCollector })
  return buildResult(mapping)
}
