import _ from 'lodash'

export function getScenarioDescription({
  pickle,
  scenarioLineToDescriptionMap
}) {
  return _.chain(pickle.locations)
    .map(({ line }) => scenarioLineToDescriptionMap[line])
    .compact()
    .first()
    .value()
}

export function getStepKeyword({ pickledStep, stepLineToKeywordMap }) {
  return _.chain(pickledStep.locations)
    .map(({ line }) => stepLineToKeywordMap[line])
    .compact()
    .first()
    .value()
}

export function getStepLineToPickledStepMap(pickle) {
  return _.chain(pickle.steps)
    .map(step => [_.last(step.locations).line, step])
    .fromPairs()
    .value()
}
