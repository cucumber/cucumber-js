import _ from 'lodash'
import {formatError, formatLocation} from './utils'
import Duration from 'duration'
import Formatter from './'
import indentString from 'indent-string'
import Status from '../status'
import Table from 'cli-table'
import Hook from '../models/hook'

const STATUS_REPORT_ORDER = [
  Status.FAILED,
  Status.AMBIGUOUS,
  Status.UNDEFINED,
  Status.PENDING,
  Status.SKIPPED,
  Status.PASSED
]

export default class SummaryFormatter extends Formatter {
  getAmbiguousStepResultMessage(stepResult) {
    const {ambiguousStepDefinitions} = stepResult
    const table = new Table({
      chars: {
        'bottom': '', 'bottom-left': '', 'bottom-mid': '', 'bottom-right': '',
        'left': '', 'left-mid': '',
        'mid': '', 'mid-mid': '', 'middle': ' - ',
        'right': '', 'right-mid': '',
        'top': '' , 'top-left': '', 'top-mid': '', 'top-right': ''
      },
      style: {
        border: [], 'padding-left': 0, 'padding-right': 0
      }
    })
    table.push.apply(table, ambiguousStepDefinitions.map((stepDefinition) => {
      const pattern = stepDefinition.pattern.toString()
      return [pattern, formatLocation(this.cwd, stepDefinition)]
    }))
    const message = 'Multiple step definitions match:' + '\n' + this.indent(table.toString(), 2)
    return this.colorFns.ambiguous(message)
  }

  getFailedStepResultMessage(stepResult) {
    const {failureException} = stepResult
    return formatError(failureException, this.colorFns)
  }

  getPendingStepResultMessage() {
    return this.colorFns.pending('Pending')
  }

  getStepResultMessage(stepResult) {
    switch (stepResult.status) {
      case Status.AMBIGUOUS:
        return this.getAmbiguousStepResultMessage(stepResult)
      case Status.FAILED:
        return this.getFailedStepResultMessage(stepResult)
      case Status.UNDEFINED:
        return this.getUndefinedStepResultMessage(stepResult)
      case Status.PENDING:
        return this.getPendingStepResultMessage(stepResult)
    }
  }

  getUndefinedStepResultMessage(stepResult) {
    const {step} = stepResult
    const snippet = this.snippetBuilder.build(step)
    const message = 'Undefined. Implement with the following snippet:' + '\n\n' + this.indent(snippet, 2)
    return this.colorFns.undefined(message)
  }

  handleFeaturesResult(featuresResult) {
    const failures = featuresResult.stepResults.filter(function (stepResult) {
      return _.includes([Status.AMBIGUOUS, Status.FAILED], stepResult.status)
    })
    if (failures.length > 0) {
      this.logIssues({stepResults: failures, title: 'Failures'})
    }
    const warnings = featuresResult.stepResults.filter(function (stepResult) {
      return _.includes([Status.PENDING, Status.UNDEFINED], stepResult.status)
    })
    if (warnings.length > 0) {
      this.logIssues({stepResults: warnings, title: 'Warnings'})
    }
    this.logCountSummary('scenario', featuresResult.scenarioResults)
    this.logCountSummary('step', featuresResult.stepResults.filter(({step}) => !(step instanceof Hook)))
    this.logDuration(featuresResult)
  }

  indent(text, numberOfSpaces) {
    return indentString(text, numberOfSpaces)
  }

  logCountSummary(type, objects) {
    const counts = _.chain(objects).groupBy('status').mapValues('length').value()
    const total = _.reduce(counts, (memo, value) => memo + value) || 0
    let text = total + ' ' + type + (total === 1 ? '' : 's')
    if (total > 0) {
      const details = []
      STATUS_REPORT_ORDER.forEach((status) => {
        if (counts[status] > 0) {
          details.push(this.colorFns[status](counts[status] + ' ' + status))
        }
      })
      text += ' (' + details.join(', ') + ')'
    }
    this.log(text + '\n')
  }

  logDuration(featuresResult) {
    const milliseconds = featuresResult.duration
    const start = new Date(0)
    const end = new Date(milliseconds)
    const duration = new Duration(start, end)

    this.log(
      duration.minutes + 'm' +
      duration.toString('%S') + '.' +
      duration.toString('%L') + 's' + '\n'
    )
  }

  logIssue({number, stepResult}) {
    const message = this.getStepResultMessage(stepResult)
    const prefix = number + ') '
    const {step} = stepResult
    const {scenario} = step
    let text = prefix

    if (scenario) {
      const scenarioLocation = formatLocation(this.cwd, scenario)
      text += 'Scenario: ' + this.colorFns.bold(scenario.name) + ' - ' + this.colorFns.location(scenarioLocation)
    } else {
      text += 'Background:'
    }
    text += '\n'

    let stepText = 'Step: ' + this.colorFns.bold(step.keyword + (step.name || ''))
    if (step.uri) {
      const stepLocation = formatLocation(this.cwd, step)
      stepText += ' - ' + this.colorFns.location(stepLocation)
    }
    text += this.indent(stepText, prefix.length) + '\n'

    const {stepDefinition} = stepResult
    if (stepDefinition) {
      const stepDefinitionLocation = formatLocation(this.cwd, stepDefinition)
      const stepDefinitionLine = 'Step Definition: ' + this.colorFns.location(stepDefinitionLocation)
      text += this.indent(stepDefinitionLine, prefix.length) + '\n'
    }

    text += this.indent('Message:', prefix.length) + '\n'
    text += this.indent(message, prefix.length + 2) + '\n\n'
    this.log(text)
  }

  logIssues({stepResults, title}) {
    this.log(title + ':\n\n')
    stepResults.forEach((stepResult, index) => {
      this.logIssue({number: index + 1, stepResult})
    })
  }
}
