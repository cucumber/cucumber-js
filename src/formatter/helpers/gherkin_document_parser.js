import _ from 'lodash'

export function getStepLineToKeywordMap(gherkinDocument) {
  return _.chain(gherkinDocument.feature.children)
    .map('steps')
    .flatten()
    .map(step => [step.location.line, step.keyword])
    .fromPairs()
    .value()
}

export function getScenarioLineToDescriptionMap(gherkinDocument) {
  return _.chain(gherkinDocument.feature.children)
    .map(element => [element.location.line, element.description])
    .fromPairs()
    .value()
}
