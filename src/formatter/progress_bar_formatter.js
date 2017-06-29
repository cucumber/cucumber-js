import _ from 'lodash'
import { formatIssue, formatSummary } from './helpers'
import Hook from '../models/hook'
import Status from '../status'
import Formatter from './'
import ProgressBar from 'progress'

const statusToReport = [
  Status.AMBIGUOUS,
  Status.FAILED,
  Status.PENDING,
  Status.UNDEFINED
]

// Inspired by https://github.com/thekompanee/fuubar and https://github.com/martinciu/fuubar-cucumber
export default class ProgressBarFormatter extends Formatter {
  constructor(options) {
    super(options)
    this.issueCount = 0
  }

  handleBeforeFeatures(features) {
    const numberOfSteps = _.sumBy(features, feature => {
      return _.sumBy(feature.scenarios, scenario => {
        return scenario.steps.length
      })
    })
    this.progressBar = new ProgressBar(':current/:total steps [:bar] ', {
      clear: true,
      incomplete: ' ',
      stream: this.stream,
      total: numberOfSteps,
      width: this.stream.columns || 80
    })
  }

  handleStepResult(stepResult) {
    if (!(stepResult.step instanceof Hook)) {
      this.progressBar.tick()
    }
  }

  handleScenarioResult(scenarioResult) {
    if (_.includes(statusToReport, scenarioResult.status)) {
      this.issueCount += 1
      this.progressBar.interrupt(
        formatIssue({
          colorFns: this.colorFns,
          cwd: this.cwd,
          number: this.issueCount,
          snippetBuilder: this.snippetBuilder,
          scenarioResult
        })
      )
    }
  }

  handleFeaturesResult(featuresResult) {
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        featuresResult
      })
    )
  }
}
