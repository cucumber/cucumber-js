import _ from 'lodash'

export function getStepIdToKeywordMap(gherkinDocument) {
  return _.chain(gherkinDocument.feature.children)
    .map(child => child.background || child.scenario)
    .map('steps')
    .flatten()
    .map(step => [step.id, step.keyword])
    .fromPairs()
    .value()
}

export function getScenarioIdToDescriptionMap(gherkinDocument) {
  return _.chain(gherkinDocument.feature.children)
    .filter('scenario')
    .map('scenario')
    .map(scenario => [scenario.id, scenario.description])
    .fromPairs()
    .value()
}
