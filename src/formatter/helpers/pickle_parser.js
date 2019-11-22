import _ from 'lodash'

export function getScenarioDescription({ pickle, gherkinScenarioMap }) {
  return _.chain(pickle.sourceIds)
    .map(id => gherkinScenarioMap[id].description)
    .compact()
    .first()
    .value()
}

export function getStepKeyword({ pickleStep, gherkinStepMap }) {
  return _.chain(pickleStep.sourceIds)
    .map(id => gherkinStepMap[id].keyword)
    .compact()
    .first()
    .value()
}

export function getPickleStepMap(pickle) {
  return _.chain(pickle.steps)
    .map(pickleStep => [pickleStep.id, pickleStep])
    .fromPairs()
    .value()
}
