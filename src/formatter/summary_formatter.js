import _ from 'lodash'
import { formatIssue, formatSummary } from './helpers'
import Formatter from './'
import Status from '../status'

export default class SummaryFormatter extends Formatter {
  handleFeaturesResult(featuresResult) {
    const failures = featuresResult.scenarioResults.filter(function(
      scenarioResult
    ) {
      return _.includes(
        [Status.AMBIGUOUS, Status.FAILED],
        scenarioResult.status
      )
    })
    if (failures.length > 0) {
      this.logIssues({ scenarioResults: failures, title: 'Failures' })
    }
    const warnings = featuresResult.scenarioResults.filter(function(
      scenarioResult
    ) {
      return _.includes(
        [Status.PENDING, Status.UNDEFINED],
        scenarioResult.status
      )
    })
    if (warnings.length > 0) {
      this.logIssues({ scenarioResults: warnings, title: 'Warnings' })
    }
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        featuresResult
      })
    )
  }

  logIssues({ scenarioResults, title }) {
    this.log(title + ':\n\n')
    scenarioResults.forEach((scenarioResult, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          cwd: this.cwd,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          scenarioResult
        })
      )
    })
  }
}
