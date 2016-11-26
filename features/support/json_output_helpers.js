import _ from 'lodash'

export function findScenario(features, predicate) {
  const scenario = _.chain(features)
    .map('elements')
    .flatten()
    .find(predicate)
    .value()
  if (scenario) {
    return scenario
  } else {
    throw new Error('Could not find scenario matching predicate')
  }
}

export function findStep(features, scenarioPredicate, stepPredicate) {
  const scenario = findScenario(features, scenarioPredicate)
  const step = _.find(scenario.steps, stepPredicate)
  if (step) {
    return step
  } else {
    throw new Error('Could not find step matching predicate')
  }
}

export function neutraliseVariableValues(report) {
  report.forEach(function (item) {
    (item.elements || []).forEach((element) => {
      (element.steps || []).forEach((step) => {
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
