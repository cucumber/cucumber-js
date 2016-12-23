import _ from 'lodash'
import Formatter from './'
import {formatLocation} from './utils'

export default class UsageFormatter extends Formatter {
  buildMapping(featuresResult) {
    const mapping = this.getInitialStepDefinitionMapping()
    featuresResult.stepResults.forEach((stepResult) => {
      const {duration, step, stepDefinition} = stepResult
      const location = formatLocation(this.cwd, stepDefinition)
      const match = {
        location: formatLocation(this.cwd, step),
        text: step.name
      }
      if (duration) {
        match.duration = duration
      }
      mapping[location].matches.push(match)
    })
    return mapping
  }

  buildResult(mapping) {
    return _.chain(mapping)
      .map(({matches, pattern}, location) => {
        const result = {location, matches, pattern}
        const meanDuration = _.meanBy(matches, 'duration')
        if (meanDuration) {
          result.meanDuration = meanDuration
        }
        return result
      })
      .sortBy(({meanDuration}) => meanDuration || 0)
      .reverse()
      .value()
  }

  getInitialStepDefinitionMapping() {
    const mapping = {}
    this.supportCodeLibrary.stepDefinitions.forEach((stepDefinition) => {
      const location = formatLocation(this.cwd, stepDefinition)
      mapping[location] = {
        pattern: stepDefinition.pattern,
        matches: []
      }
    })
    return mapping
  }

  handleFeaturesResult(featuresResult) {
    const mapping = this.buildMapping(featuresResult)
    const result = this.buildResult(mapping)
    this.log(JSON.stringify(result, null, 2))
  }
}
