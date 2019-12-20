import _ from 'lodash'
import { getGherkinScenarioLocationMap, IGherkinStepMap, IGherkinScenarioMap } from './gherkin_document_parser'
import { messages } from 'cucumber-messages'

export interface IGetPickleLocationRequest {
  gherkinDocument: messages.IGherkinDocument
  pickle: messages.IPickle
}

export interface IGetStepKeywordRequest {
  pickleStep: messages.Pickle.IPickleStep
  gherkinStepMap: IGherkinStepMap
}

export interface IGetScenarioDescriptionRequest {
  pickle: messages.IPickle
  gherkinScenarioMap: IGherkinScenarioMap
}

export interface IPickleStepMap {
  [pickleStepId: string]: messages.Pickle.IPickleStep
}

export function getScenarioDescription({ pickle, gherkinScenarioMap }: IGetScenarioDescriptionRequest): string {
  return _.chain(pickle.astNodeIds)
    .map(id => gherkinScenarioMap[id])
    .compact()
    .first()
    .value().description
}

export function getStepKeyword({ pickleStep, gherkinStepMap }: IGetStepKeywordRequest): string {
  return _.chain(pickleStep.astNodeIds)
    .map(id => gherkinStepMap[id])
    .compact()
    .first()
    .value().keyword
}

export function getPickleStepMap(pickle: messages.IPickle): IPickleStepMap {
  return _.chain(pickle.steps)
    .map(pickleStep => [pickleStep.id, pickleStep])
    .fromPairs()
    .value()
}

export function getPickleLocation({ gherkinDocument, pickle }: IGetPickleLocationRequest): messages.ILocation {
  const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
    gherkinDocument
  )
  return gherkinScenarioLocationMap[_.last(pickle.astNodeIds)]
}
