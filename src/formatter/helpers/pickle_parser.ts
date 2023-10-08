import * as messages from '@cucumber/messages'
import { getGherkinScenarioLocationMap } from './gherkin_document_parser'

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
  return pickle.astNodeIds
    .map((id) => gherkinScenarioMap[id])
    .filter((x) => x != null)[0].description
}

export function getStepKeyword({
  pickleStep,
  gherkinStepMap,
}: IGetStepKeywordRequest): string {
  return pickleStep.astNodeIds
    .map((id) => gherkinStepMap[id])
    .filter((x) => x != null)[0].keyword
}

export function getPickleStepMap(
  pickle: messages.Pickle
): Record<string, messages.PickleStep> {
  const result: Record<string, messages.PickleStep> = {}
  pickle.steps.forEach((pickleStep) => (result[pickleStep.id] = pickleStep))
  return result
}

export function getPickleLocation({
  gherkinDocument,
  pickle,
}: IGetPickleLocationRequest): messages.Location {
  const gherkinScenarioLocationMap =
    getGherkinScenarioLocationMap(gherkinDocument)
  return gherkinScenarioLocationMap[
    pickle.astNodeIds[pickle.astNodeIds.length - 1]
  ]
}
