import _, { Dictionary } from 'lodash'
import { messages } from 'cucumber-messages'

export function getGherkinStepMap(
  gherkinDocument: messages.IGherkinDocument
): Dictionary<messages.GherkinDocument.Feature.IStep> {
  return _.chain(gherkinDocument.feature.children)
    .map(
      (child: messages.GherkinDocument.Feature.IFeatureChild) =>
        child.background || child.scenario
    )
    .map('steps')
    .flatten()
    .map((step: messages.GherkinDocument.Feature.IStep) => [step.id, step])
    .fromPairs()
    .value()
}

export function getGherkinScenarioMap(
  gherkinDocument: messages.IGherkinDocument
): Dictionary<messages.GherkinDocument.Feature.IScenario> {
  return _.chain(gherkinDocument.feature.children)
    .filter('scenario')
    .map('scenario')
    .map((scenario: messages.GherkinDocument.Feature.IScenario) => [
      scenario.id,
      scenario,
    ])
    .fromPairs()
    .value()
}

export function getGherkinScenarioLocationMap(
  gherkinDocument: messages.IGherkinDocument
): Dictionary<messages.ILocation> {
  const map: Dictionary<messages.ILocation> = {}
  for (const child of gherkinDocument.feature.children) {
    if (child.scenario) {
      map[child.scenario.id] = child.scenario.location
      if (child.scenario.examples) {
        for (const examples of child.scenario.examples) {
          for (const tableRow of examples.tableBody) {
            map[tableRow.id] = tableRow.location
          }
        }
      }
    }
  }
  return map
}
