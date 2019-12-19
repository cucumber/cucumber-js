import _ from 'lodash'

export function getGherkinStepMap(gherkinDocument) {
  return _.chain(gherkinDocument.feature.children)
    .map(child => child.background || child.scenario)
    .map('steps')
    .flatten()
    .map(step => [step.id, step])
    .fromPairs()
    .value()
}

export function getGherkinScenarioMap(gherkinDocument) {
  return _.chain(gherkinDocument.feature.children)
    .filter('scenario')
    .map('scenario')
    .map(scenario => [scenario.id, scenario])
    .fromPairs()
    .value()
}

export function getGherkinScenarioLocationMap(gherkinDocument) {
  const map = {}
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
