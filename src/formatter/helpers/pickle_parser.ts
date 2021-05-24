import _ from 'lodash'
import { getGherkinScenarioLocationMap } from './gherkin_document_parser'
import * as messages from '@cucumber/messages'

export interface IGetPickleLocationRequest {
  gherkinDocument: messages.GherkinDocument
  pickle: messages.Pickle
}

export interface IGetStepKeywordRequest {
  pickleStep: messages.PickleStep
  gherkinStepMap: Record<string, messages.Step>
}

export interface IGetScenarioDescriptionRequest {
  pickle: messages.Pickle
  gherkinScenarioMap: Record<string, messages.Scenario>
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
): Record<string, messages.PickleStep> {
  return _.chain(pickle.steps)
    .map((pickleStep) => [pickleStep.id, pickleStep])
    .fromPairs()
    .value()
}

export function getPickleLocation({
  gherkinDocument,
  pickle,
}: IGetPickleLocationRequest): messages.Location {
  const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(
    gherkinDocument
  )
  return gherkinScenarioLocationMap[_.last(pickle.astNodeIds)]
}
