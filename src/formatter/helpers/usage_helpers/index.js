import _ from 'lodash'
import { getPickleStepMap } from '../pickle_parser'
import path from 'path'
import { getGherkinStepMap } from '../gherkin_document_parser'
import { durationToMilliseconds, millisecondsToDuration } from '../../../time'

function getCodeAsString(stepDefinition) {
  if (typeof stepDefinition.unwrappedCode === 'function') {
    return stepDefinition.unwrappedCode.toString()
  }
  return stepDefinition.code.toString()
}

function buildEmptyMapping(stepDefinitions) {
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

function buildMapping({ cwd, stepDefinitions, eventDataCollector }) {
  const mapping = buildEmptyMapping(stepDefinitions)
  _.each(eventDataCollector.getTestCaseAttempts(), testCaseAttempt => {
    const pickleStepMap = getPickleStepMap(testCaseAttempt.pickle)
    const gherkinStepMap = getGherkinStepMap(testCaseAttempt.gherkinDocument)
    testCaseAttempt.testCase.testSteps.forEach(testStep => {
      if (testStep.pickleStepId && testStep.stepDefinitionIds.length === 1) {
        const stepDefinitionId = testStep.stepDefinitionIds[0]
        const pickleStep = pickleStepMap[testStep.pickleStepId]
        const gherkinStep = gherkinStepMap[pickleStep.astNodeIds[0]]
        const match = {
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

function invertNumber(key) {
  return obj => {
    const value = obj[key]
    if (value) {
      return -1 * durationToMilliseconds(value)
    }
    return 1
  }
}

function buildResult(mapping) {
  return _.chain(mapping)
    .map(({ matches, ...rest }) => {
      const sortedMatches = _.sortBy(matches, [
        invertNumber('duration'),
        'text',
      ])
      const result = { matches: sortedMatches, ...rest }
      const durations = _.chain(matches)
        .map(m => m.duration)
        .compact()
        .value()
      if (durations.length > 0) {
        result.meanDuration = millisecondsToDuration(
          _.meanBy(durations, d => durationToMilliseconds(d))
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
