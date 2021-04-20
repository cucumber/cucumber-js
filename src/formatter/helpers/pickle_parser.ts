import _, { Dictionary } from 'lodash'
import { getGherkinScenarioLocationMap } from './gherkin_document_parser'
import messages from '@cucumber/messages'

export interface IGetPickleLocationRequest {
  gherkinDocument: messages.GherkinDocument
  pickle: messages.Pickle
}

export interface IGetStepKeywordRequest {
  pickleStep: messages.PickleStep
  gherkinStepMap: Dictionary<messages.GherkinDocument.Feature.IStep>
}

export interface IGetScenarioDescriptionRequest {
  pickle: messages.Pickle
  gherkinScenarioMap: Dictionary<messages.GherkinDocument.Feature.IScenario>
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
  pickle: messages.Pickle
): Dictionary<messages.PickleStep> {
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
