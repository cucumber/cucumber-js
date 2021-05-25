import _ from 'lodash'
import * as messages from '@cucumber/messages'
import { doesHaveValue } from '../../value_checker'

export function getGherkinStepMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Step> {
  return _.chain(gherkinDocument.feature.children)
    .map(extractStepContainers)
    .flatten()
    .map('steps')
    .flatten()
    .map((step: messages.Step) => [step.id, step])
    .fromPairs()
    .value()
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
  return _.chain(gherkinDocument.feature.children)
    .map((child: messages.FeatureChild) => {
      if (doesHaveValue(child.rule)) {
        return child.rule.children
      }
      return [child]
    })
    .flatten()
    .filter('scenario')
    .map('scenario')
    .map((scenario: messages.Scenario) => [scenario.id, scenario])
    .fromPairs()
    .value()
}

export function getGherkinExampleRuleMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Rule> {
  return _.chain(gherkinDocument.feature.children)
    .filter('rule')
    .map('rule')
    .map((rule) => {
      return rule.children
        .filter((child) => doesHaveValue(child.scenario))
        .map((child) => [child.scenario.id, rule])
    })
    .flatten()
    .fromPairs()
    .value()
}

export function getGherkinScenarioLocationMap(
  gherkinDocument: messages.GherkinDocument
): Record<string, messages.Location> {
  const locationMap: Record<string, messages.Location> = {}
  const scenarioMap: Record<string, messages.Scenario> = getGherkinScenarioMap(
    gherkinDocument
  )
  _.entries<messages.Scenario>(scenarioMap).forEach(([id, scenario]) => {
    locationMap[id] = scenario.location
    if (doesHaveValue(scenario.examples)) {
      _.chain(scenario.examples)
        .map('tableBody')
        .flatten()
        .forEach((tableRow) => {
          locationMap[tableRow.id] = tableRow.location
        })
        .value()
    }
  })
  return locationMap
}
