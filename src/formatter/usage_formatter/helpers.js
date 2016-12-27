import _ from 'lodash'
import {formatLocation} from '../utils'
import Hook from '../../models/hook'

function buildEmptyMapping({cwd, stepDefinitions}) {
  const mapping = {}
  stepDefinitions.forEach((stepDefinition) => {
    const location = formatLocation(cwd, stepDefinition)
    mapping[location] = {
      pattern: stepDefinition.pattern,
      matches: []
    }
  })
  return mapping
}

function buildMapping({cwd, stepDefinitions, stepResults}) {
  const mapping = buildEmptyMapping({cwd, stepDefinitions})
  stepResults.forEach((stepResult) => {
    const {duration, step, stepDefinition} = stepResult
    if (!(step instanceof Hook) && stepDefinition) {
      const location = formatLocation(cwd, stepDefinition)
      const match = {
        location: formatLocation(cwd, step),
        text: step.name
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
    .map(({matches, pattern}, location) => {
      const sortedMatches = _.sortBy(matches, [invertNumber('duration'), 'text'])
      const result = {location, matches: sortedMatches, pattern}
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
