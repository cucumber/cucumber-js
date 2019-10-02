import _ from 'lodash'

export function getStepLineToKeywordMap(gherkinDocument) {
  return _.chain(gherkinDocument.feature.children)
    .map(child => child.background || child.scenario)
    .map('steps')
    .flatten()
    .map(step => [step.location.line, step.keyword])
    .fromPairs()
    .value()
}

export function getScenarioLineToDescriptionMap(gherkinDocument) {
  return _.chain(gherkinDocument.feature.children)
    .filter('scenario')
    .map('scenario')
    .map(scenario => [scenario.location.line, scenario.description])
    .fromPairs()
    .value()
}
