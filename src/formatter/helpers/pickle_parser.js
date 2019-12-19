import _ from 'lodash'
import { getGherkinScenarioLocationMap } from './gherkin_document_parser'

export function getScenarioDescription({ pickle, gherkinScenarioMap }) {
  return _.chain(pickle.astNodeIds)
    .map(id => gherkinScenarioMap[id])
    .compact()
    .first()
    .value().description
}

export function getStepKeyword({ pickleStep, gherkinStepMap }) {
  return _.chain(pickleStep.astNodeIds)
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

export function getPickleLocation({ gherkinDocument, pickle }) {
  const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
    gherkinDocument
  )
  return gherkinScenarioLocationMap[_.last(pickle.astNodeIds)]
}
