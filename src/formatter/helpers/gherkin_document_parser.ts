import type {
  Background,
  FeatureChild,
  GherkinDocument,
  Location,
  Rule,
  Scenario,
  Step,
} from '@cucumber/messages'
import { doesHaveValue } from '../../value_checker'

export function getGherkinStepMap(gherkinDocument: GherkinDocument): Record<string, Step> {
  const result: Record<string, Step> = {}
  for (const container of gherkinDocument.feature.children.flatMap(extractStepContainers)) {
    for (const step of container.steps) {
      result[step.id] = step
    }
  }
  return result
}

function extractStepContainers(child: FeatureChild): Array<Scenario | Background> {
  if (doesHaveValue(child.background)) {
    return [child.background]
  } else if (doesHaveValue(child.rule)) {
    return child.rule.children.map((ruleChild) =>
      doesHaveValue(ruleChild.background) ? ruleChild.background : ruleChild.scenario
    )
  }
  return [child.scenario]
}

export function getGherkinScenarioMap(gherkinDocument: GherkinDocument): Record<string, Scenario> {
  const result: Record<string, Scenario> = {}
  gherkinDocument.feature.children
    .flatMap((child: FeatureChild) => {
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

export function getGherkinExampleRuleMap(gherkinDocument: GherkinDocument): Record<string, Rule> {
  const result: Record<string, Rule> = {}
  for (const x of gherkinDocument.feature.children.filter((x) => x.rule != null)) {
    for (const child of x.rule.children.filter((child) => doesHaveValue(child.scenario))) {
      result[child.scenario.id] = x.rule
    }
  }
  return result
}

export function getGherkinScenarioLocationMap(
  gherkinDocument: GherkinDocument
): Record<string, Location> {
  const locationMap: Record<string, Location> = {}
  const scenarioMap: Record<string, Scenario> = getGherkinScenarioMap(gherkinDocument)
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
