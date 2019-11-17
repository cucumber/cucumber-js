import _ from 'lodash'

export function getScenarioDescription({
  pickle,
  scenarioIdToDescriptionMap,
}) {
  return _.chain(pickle.sourceIds)
    .map((id) => scenarioIdToDescriptionMap[id])
    .compact()
    .first()
    .value()
}

export function getStepKeyword({ pickleStep, stepIdToKeywordMap }) {
  return _.chain(pickleStep.sourceIds)
    .map((id) => stepIdToKeywordMap[id])
    .compact()
    .first()
    .value()
}

export function getStepLineToPickledStepMap(pickle) {
  return _.chain(pickle.steps)
    .map(step => [getPickleStepLine(step), step])
    .fromPairs()
    .value()
}

export function getPickleStepLine(pickleStep) {
  return _.first(pickleStep.locations).line
}
