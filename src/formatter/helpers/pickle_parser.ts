import _ from 'lodash'
import { getGherkinScenarioLocationMap } from './gherkin_document_parser'
import { messages } from '@cucumber/messages'

export interface IGetPickleLocationRequest {
  gherkinDocument: messages.IGherkinDocument
  pickle: messages.IPickle
}

export interface IGetStepKeywordRequest {
  pickleStep: messages.Pickle.IPickleStep
  gherkinStepMap: Record<string, messages.GherkinDocument.Feature.IStep>
}

export interface IGetScenarioDescriptionRequest {
  pickle: messages.IPickle
  gherkinScenarioMap: Record<string, messages.GherkinDocument.Feature.IScenario>
}

export function getScenarioDescription({
  pickle,
  gherkinScenarioMap,
}: IGetScenarioDescriptionRequest): string {
  return _.chain(pickle.astNodeIds)
    .map((id) => gherkinScenarioMap[id])
    .compact()
    .first()
    .value().description
}

export function getStepKeyword({
  pickleStep,
  gherkinStepMap,
}: IGetStepKeywordRequest): string {
  return _.chain(pickleStep.astNodeIds)
    .map((id) => gherkinStepMap[id])
    .compact()
    .first()
    .value().keyword
}

export function getPickleStepMap(
  pickle: messages.IPickle
): Record<string, messages.Pickle.IPickleStep> {
  return _.chain(pickle.steps)
    .map((pickleStep) => [pickleStep.id, pickleStep])
    .fromPairs()
    .value()
}

export function getPickleLocation({
  gherkinDocument,
  pickle,
}: IGetPickleLocationRequest): messages.ILocation {
  const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
    gherkinDocument
  )
  return gherkinScenarioLocationMap[_.last(pickle.astNodeIds)]
}
