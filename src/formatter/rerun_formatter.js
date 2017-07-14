import _ from 'lodash'
import Formatter from './'
import Status from '../status'

export default class RerunFormatter extends Formatter {
  handleFeaturesResult(featuresResult) {
    const mapping = {}
    featuresResult.scenarioResults.forEach(scenarioResult => {
      if (scenarioResult.status !== Status.PASSED) {
        const { scenario } = scenarioResult
        const { uri } = scenario
        if (!mapping[uri]) {
          mapping[uri] = []
        }
        mapping[uri].push(scenario.line)
      }
    })
    const text = _.map(mapping, (lines, uri) => {
      return uri + ':' + lines.join(':')
    }).join('\n')
    this.log(text)
  }
}
