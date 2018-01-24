import _ from 'lodash'
import util from 'util'

export function getScenarioNames(features) {
  return _.chain(features)
    .map('elements')
    .flatten()
    .map('name')
    .value()
}

export function getSteps(features) {
  return _.chain(features)
    .map('elements')
    .flatten()
    .map('steps')
    .flatten()
    .value()
}

export function findScenario({ features, scenarioPredicate }) {
  const scenario = _.chain(features)
    .map('elements')
    .flatten()
    .find(scenarioPredicate)
    .value()
  if (scenario) {
    return scenario
  } else {
    throw new Error('Could not find scenario matching predicate')
  }
}

export function findStep({ features, stepPredicate, scenarioPredicate }) {
  let steps
  if (scenarioPredicate) {
    steps = findScenario({ features, scenarioPredicate }).steps
  } else {
    steps = _.chain(features)
      .map('elements')
      .flatten()
      .map('steps')
      .flatten()
      .value()
  }
  const step = _.find(steps, stepPredicate)
  if (step) {
    return step
  } else {
    throw new Error(
      `Could not find step matching predicate: ${util.inspect(features, {
        depth: null
      })}`
    )
  }
}

export function neutraliseVariableValues(report) {
  report.forEach(function(item) {
    ;(item.elements || []).forEach(element => {
      ;(element.steps || []).forEach(step => {
        if ('result' in step) {
          if ('error_message' in step.result) {
            step.result.error_message = '<error-message>'
          }
          if ('duration' in step.result) {
            step.result.duration = '<duration>'
          }
        }
      })
    })
  })
}
