export function findScenario(features, predicate) {
  let found = null
  features.forEach((feature) => {
    feature.elements.forEach((element, index) => {
      if (predicate(element, index)) {
        found = element
      }
    })
  })
  if (found === null) {
    throw new Error('Could not find scenario matching predicate')
  }
  return found
}

export function findStep(features, scenarioPredicate, stepPredicate) {
  var scenario = findScenario(features, scenarioPredicate)
  var found = null
  scenario.steps.forEach((step) => {
    if (stepPredicate(step)) {
      found = step
    }
  })
  if (found === null){
    throw new Error('Could not find step matching predicate')
  }
  return found
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
