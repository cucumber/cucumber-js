import {getUsage} from './usage_helpers'
import Formatter from './'

export default class UsageJsonFormatter extends Formatter {
  handleFeaturesResult(featuresResult) {
    const usage = getUsage({
      cwd: this.cwd,
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      stepResults: featuresResult.stepResults
    })
    this.log(JSON.stringify(usage, null, 2))
  }
}
