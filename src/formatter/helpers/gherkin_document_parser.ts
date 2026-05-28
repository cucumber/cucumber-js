import type * as messages from '@cucumber/messages'
import { doesHaveValue } from '../../value_checker'

export function getGherkinStepMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Step> {
  const result: Record<string, messages.Step> = {}
  for (const container of gherkinDocument.feature.children.flatMap(extractStepContainers)) {
    for (const step of container.steps) {
      result[step.id] = step
    }
  }
  return result
}

function extractStepContainers(
  child: messages.FeatureChild
): Array<messages.Scenario | messages.Background> {
  if (doesHaveValue(child.background)) {
    return [child.background]
  } else if (doesHaveValue(child.rule)) {
    return child.rule.children.map((ruleChild) =>
      doesHaveValue(ruleChild.background) ? ruleChild.background : ruleChild.scenario
    )
  }
  return [child.scenario]
}

export function getGherkinScenarioMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Scenario> {
  const result: Record<string, messages.Scenario> = {}
  gherkinDocument.feature.children
    .flatMap((child: messages.FeatureChild) => {
      if (doesHaveValue(child.rule)) {
        return child.rule.children
      }
      return [child]
    })
    .forEach((x) => {
      if (x.scenario != null) {
        result[x.scenario.id] = x.scenario
      }
    })
  return result
}

export function getGherkinExampleRuleMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Rule> {
  const result: Record<string, messages.Rule> = {}
  for (const x of gherkinDocument.feature.children.filter((x) => x.rule != null)) {
    for (const child of x.rule.children.filter((child) => doesHaveValue(child.scenario))) {
      result[child.scenario.id] = x.rule
    }
  }
  return result
}

export function getGherkinScenarioLocationMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Location> {
  const locationMap: Record<string, messages.Location> = {}
  const scenarioMap: Record<string, messages.Scenario> = getGherkinScenarioMap(gherkinDocument)
  for (const id of Object.keys(scenarioMap)) {
    const scenario = scenarioMap[id]
    locationMap[id] = scenario.location
    if (doesHaveValue(scenario.examples)) {
      for (const example of scenario.examples) {
        for (const tableRow of example.tableBody) {
          locationMap[tableRow.id] = tableRow.location
        }
      }
    }
  }
  return locationMap
}
