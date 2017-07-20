import _ from 'lodash'
import { formatLocation } from '../location_helpers'
import { getStepLineToPickledStepMap } from '../../../pickle_parser'

function buildEmptyMapping(stepDefinitions) {
  const mapping = {}
  stepDefinitions.forEach(stepDefinition => {
    const location = formatLocation(stepDefinition)
    mapping[location] = {
      line: stepDefinition.line,
      pattern: stepDefinition.pattern,
      matches: [],
      uri: stepDefinition.uri
    }
  })
  return mapping
}

function buildMapping({ stepDefinitions, eventDataCollector }) {
  const mapping = buildEmptyMapping(stepDefinitions)
  _.each(eventDataCollector.testCaseMap, testCase => {
    const { pickle } = eventDataCollector.getTestCaseData(
      testCase.sourceLocation
    )
    const stepLineToPickledStepMap = getStepLineToPickledStepMap(pickle)
    testCase.steps.forEach(testStep => {
      const { actionLocation, sourceLocation, result: { duration } } = testStep
      if (sourceLocation) {
        const location = formatLocation(actionLocation)
        const match = {
          line: sourceLocation.line,
          text: stepLineToPickledStepMap[sourceLocation.line].text,
          uri: sourceLocation.uri
        }
        if (isFinite(duration)) {
          match.duration = duration
        }
        if (mapping[location]) {
          mapping[location].matches.push(match)
        }
      }
    })
  })
  return mapping
}

function invertNumber(key) {
  return obj => {
    const value = obj[key]
    if (isFinite(value)) {
      return -1 * value
    }
    return 1
  }
}

function buildResult(mapping) {
  return _.chain(mapping)
    .map(({ line, matches, pattern, uri }) => {
      const sortedMatches = _.sortBy(matches, [
        invertNumber('duration'),
        'text'
      ])
      const result = { line, matches: sortedMatches, pattern, uri }
      const meanDuration = _.meanBy(matches, 'duration')
      if (isFinite(meanDuration)) {
        result.meanDuration = meanDuration
      }
      return result
    })
    .sortBy(invertNumber('meanDuration'))
    .value()
}

export function getUsage({ stepDefinitions, eventDataCollector }) {
  const mapping = buildMapping({ stepDefinitions, eventDataCollector })
  return buildResult(mapping)
}
