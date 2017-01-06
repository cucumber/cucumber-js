import _ from 'lodash'
import {formatLocation} from '../utils'
import Hook from '../../models/hook'

function buildEmptyMapping(stepDefinitions) {
  const mapping = {}
  stepDefinitions.forEach((stepDefinition) => {
    const location = formatLocation('', stepDefinition)
    mapping[location] = {
      line: stepDefinition.line,
      pattern: stepDefinition.pattern,
      matches: [],
      uri: stepDefinition.uri
    }
  })
  return mapping
}

function buildMapping({stepDefinitions, stepResults}) {
  const mapping = buildEmptyMapping(stepDefinitions)
  stepResults.forEach((stepResult) => {
    const {duration, step, stepDefinition} = stepResult
    if (!(step instanceof Hook) && stepDefinition) {
      const location = formatLocation('', stepDefinition)
      const match = {
        line: step.line,
        text: step.name,
        uri: step.uri
      }
      if (isFinite(duration)) {
        match.duration = duration
      }
      if (mapping[location]) {
        mapping[location].matches.push(match)
      }
    }
  })
  return mapping
}

function invertNumber(key) {
  return (obj) => {
    const value = obj[key]
    if (isFinite(value)) {
      return -1 * value
    }
    return 1
  }
}

function buildResult(mapping) {
  return _.chain(mapping)
    .map(({line, matches, pattern, uri}) => {
      const sortedMatches = _.sortBy(matches, [invertNumber('duration'), 'text'])
      const result = {line, matches: sortedMatches, pattern, uri}
      const meanDuration = _.meanBy(matches, 'duration')
      if (isFinite(meanDuration)) {
        result.meanDuration = meanDuration
      }
      return result
    })
    .sortBy(invertNumber('meanDuration'))
    .value()
}

export function getUsage({cwd, stepDefinitions, stepResults}) {
  const mapping = buildMapping({cwd, stepDefinitions, stepResults})
  return buildResult(mapping)
}
