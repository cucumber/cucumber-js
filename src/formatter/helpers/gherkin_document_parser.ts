import _, { Dictionary } from 'lodash'
import { messages } from '@cucumber/messages'
import { doesHaveValue } from '../../value_checker'

export function getGherkinStepMap(
  gherkinDocument: messages.IGherkinDocument
): Dictionary<messages.GherkinDocument.Feature.IStep> {
  return _.chain(gherkinDocument.feature.children)
    .map(extractStepContainers)
    .flatten()
    .map('steps')
    .flatten()
    .map((step: messages.GherkinDocument.Feature.IStep) => [step.id, step])
    .fromPairs()
    .value()
}

function extractStepContainers(
  child: messages.GherkinDocument.Feature.IFeatureChild
): Array<
  | messages.GherkinDocument.Feature.IScenario
  | messages.GherkinDocument.Feature.IBackground
> {
  if (doesHaveValue(child.background)) {
    return [child.background]
  } else if (doesHaveValue(child.rule)) {
    return child.rule.children.map(ruleChild =>
      doesHaveValue(ruleChild.background)
        ? ruleChild.background
        : ruleChild.scenario
    )
  }
  return [child.scenario]
}

export function getGherkinScenarioMap(
  gherkinDocument: messages.IGherkinDocument
): Dictionary<messages.GherkinDocument.Feature.IScenario> {
  return _.chain(gherkinDocument.feature.children)
    .map((child: messages.GherkinDocument.Feature.IFeatureChild) => {
      if (doesHaveValue(child.rule)) {
        return child.rule.children
      }
      return [child]
    })
    .flatten()
    .filter('scenario')
    .map('scenario')
    .map((scenario: messages.GherkinDocument.Feature.IScenario) => [
      scenario.id,
      scenario,
    ])
    .fromPairs()
    .value()
}

export function getGherkinExampleRuleMap(
  gherkinDocument: messages.IGherkinDocument
): Dictionary<messages.GherkinDocument.Feature.FeatureChild.IRule> {
  return _.chain(gherkinDocument.feature.children)
    .filter('rule')
    .map('rule')
    .map(rule => {
      return rule.children
        .filter(child => doesHaveValue(child.scenario))
        .map(child => [child.scenario.id, rule])
    })
    .flatten()
    .fromPairs()
    .value()
}

export function getGherkinScenarioLocationMap(
  gherkinDocument: messages.IGherkinDocument
): Dictionary<messages.ILocation> {
  const locationMap: Dictionary<messages.ILocation> = {}
  const scenarioMap: Dictionary<messages.GherkinDocument.Feature.IScenario> = getGherkinScenarioMap(
    gherkinDocument
  )
  _.entries<messages.GherkinDocument.Feature.IScenario>(scenarioMap).forEach(
    ([id, scenario]) => {
      locationMap[id] = scenario.location
      if (doesHaveValue(scenario.examples)) {
        _.chain(scenario.examples)
          .map('tableBody')
          .flatten()
          .forEach(tableRow => {
            locationMap[tableRow.id] = tableRow.location
          })
          .value()
      }
    }
  )
  return locationMap
}
