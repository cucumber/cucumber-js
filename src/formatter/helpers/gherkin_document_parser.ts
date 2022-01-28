import * as messages from '@cucumber/messages'
import { doesHaveValue } from '../../value_checker'

export function getGherkinStepMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Step> {
  const result: Record<string, messages.Step> = {}
  gherkinDocument.feature.children
    .map(extractStepContainers)
    .flat()
    .forEach((x) =>
      x.steps.forEach((step: messages.Step) => (result[step.id] = step))
    )
  return result
}

function extractStepContainers(
  child: messages.FeatureChild
): Array<messages.Scenario | messages.Background> {
  if (doesHaveValue(child.background)) {
    return [child.background]
  } else if (doesHaveValue(child.rule)) {
    return child.rule.children.map((ruleChild) =>
      doesHaveValue(ruleChild.background)
        ? ruleChild.background
        : ruleChild.scenario
    )
  }
  return [child.scenario]
}

export function getGherkinScenarioMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Scenario> {
  const result: Record<string, messages.Scenario> = {}
  gherkinDocument.feature.children
    .map((child: messages.FeatureChild) => {
      if (doesHaveValue(child.rule)) {
        return child.rule.children
      }
      return [child]
    })
    .flat()
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
  gherkinDocument.feature.children
    .filter((x) => x.rule != null)
    .forEach((x) =>
      x.rule.children
        .filter((child) => doesHaveValue(child.scenario))
        .forEach((child) => (result[child.scenario.id] = x.rule))
    )
  return result
}

export function getGherkinScenarioLocationMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Location> {
  const locationMap: Record<string, messages.Location> = {}
  const scenarioMap: Record<string, messages.Scenario> =
    getGherkinScenarioMap(gherkinDocument)
  Object.keys(scenarioMap).forEach((id) => {
    const scenario = scenarioMap[id]
    locationMap[id] = scenario.location
    if (doesHaveValue(scenario.examples)) {
      scenario.examples.forEach((x) =>
        x.tableBody.forEach(
          (tableRow) => (locationMap[tableRow.id] = tableRow.location)
        )
      )
    }
  })
  return locationMap
}
