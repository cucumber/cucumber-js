import _ from 'lodash'

export function getScenarioDescription({ pickle, gherkinScenarioMap }) {
  return _.chain(pickle.sourceIds)
    .map(id => gherkinScenarioMap[id])
    .compact()
    .first()
    .value().description
}

export function getStepKeyword({ pickleStep, gherkinStepMap }) {
  return _.chain(pickleStep.sourceIds)
    .map(id => gherkinStepMap[id])
    .compact()
    .first()
    .value().keyword
}

export function getPickleStepMap(pickle) {
  return _.chain(pickle.steps)
    .map(pickleStep => [pickleStep.id, pickleStep])
    .fromPairs()
    .value()
}
