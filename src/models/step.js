import _ from 'lodash'
import {getStepKeywordType} from '../keyword_type'
import StepArguments from './step_arguments'

export default class Step {
  constructor(options) {
    const {
      backgroundLines,
      gherkinData,
      language,
      lineToKeywordMapping,
      previousStep,
      scenario
    } = options

    this.arguments = _.map(gherkinData.arguments, StepArguments.build)
    this.line = _.last(_.map(gherkinData.locations, 'line'))
    this.name = gherkinData.text
    this.scenario = scenario
    this.uri = scenario.uri

    this.isBackground = _.some(gherkinData.locations, ({line}) => {
      return _.includes(backgroundLines, line)
    })

    this.keyword = _.chain(gherkinData.locations)
      .map(({line}) => lineToKeywordMapping[line])
      .compact()
      .first()
      .value()

    this.keywordType = getStepKeywordType({language, previousStep, step: this})
  }
}
