import _ from 'lodash'
import Gherkin from 'gherkin'
import Step from './step'
import Tag from './tag'

export default class Scenario {
  constructor(options) {
    const {
      backgroundStepLines,
      feature,
      gherkinData,
      language,
      lineToDescriptionMapping,
      stepLineToKeywordMapping
    } = options

    this.feature = feature
    this.keyword = _.first(Gherkin.DIALECTS[language].scenario)
    this.lines = _.map(gherkinData.locations, 'line')
    this.name = gherkinData.name
    this.tags = _.map(gherkinData.tags, Tag.build)
    this.uri = feature.uri

    this.line = _.first(this.lines)
    this.description = _.chain(this.lines)
      .map(line => lineToDescriptionMapping[line])
      .compact()
      .first()
      .value()

    let previousStep
    this.steps = _.map(gherkinData.steps, gherkinStepData => {
      const step = new Step({
        backgroundLines: backgroundStepLines,
        gherkinData: gherkinStepData,
        language,
        lineToKeywordMapping: stepLineToKeywordMapping,
        previousStep,
        scenario: this
      })
      previousStep = step
      return step
    })
  }
}
