import type {
  GherkinDocument,
  Location,
  Pickle,
  PickleStep,
  Scenario,
  Step,
} from '@cucumber/messages'
import { getGherkinScenarioLocationMap } from './gherkin_document_parser'

export interface IGetPickleLocationRequest {
  gherkinDocument: GherkinDocument
  pickle: Pickle
}

export interface IGetStepKeywordRequest {
  pickleStep: PickleStep
  gherkinStepMap: Record<string, Step>
}

export interface IGetScenarioDescriptionRequest {
  pickle: Pickle
  gherkinScenarioMap: Record<string, Scenario>
}

export function getScenarioDescription({
  pickle,
  gherkinScenarioMap,
}: IGetScenarioDescriptionRequest): string {
  return pickle.astNodeIds.map((id) => gherkinScenarioMap[id]).filter((x) => x != null)[0]
    .description
}

export function getStepKeyword({ pickleStep, gherkinStepMap }: IGetStepKeywordRequest): string {
  return pickleStep.astNodeIds.map((id) => gherkinStepMap[id]).filter((x) => x != null)[0].keyword
}

export function getPickleStepMap(pickle: Pickle): Record<string, PickleStep> {
  const result: Record<string, PickleStep> = {}
  for (const pickleStep of pickle.steps) {
    result[pickleStep.id] = pickleStep
  }
  return result
}

export function getPickleLocation({
  gherkinDocument,
  pickle,
}: IGetPickleLocationRequest): Location {
  const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(gherkinDocument)
  return gherkinScenarioLocationMap[pickle.astNodeIds[pickle.astNodeIds.length - 1]]
}
