import SummaryFormatter from './summary_formatter'
import indentString from 'indent-string'
import figures from 'figures'
import Status from '../status'
import Hook from '../models/hook'
import DataTable from '../models/step_arguments/data_table'
import DocString from '../models/step_arguments/doc_string'
import Table from 'cli-table'

export default class VerboseSummaryFormatter extends SummaryFormatter {
  resetScenarioStepsOutput() {
    this.scenarioStepsOutput = []
  }

  formatTags(tags) {
    if (tags.length === 0) {
      return ''
    }
    const tagNames = tags.map((tag) => tag.name)
    return this.colorFns.tag(tagNames.join(' '))
  }

  logIndented(text, level) {
    this.log(indentString(text, level * 2))
  }

  formatDataTable(dataTable) {
    const rows = dataTable.raw().map((row) => {
      return row.map((cell) => {
        return cell.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
      })
    })
    const table = new Table({
      chars: {
        'bottom': '', 'bottom-left': '', 'bottom-mid': '', 'bottom-right': '',
        'left': '|', 'left-mid': '',
        'mid': '', 'mid-mid': '', 'middle': '|',
        'right': '|', 'right-mid': '',
        'top': '' , 'top-left': '', 'top-mid': '', 'top-right': ''
      },
      style: {
        border: [], 'padding-left': 1, 'padding-right': 1
      }
    })
    table.push.apply(table, rows)
    return table.toString()
  }

  formatDocString(docString) {
    return '"""\n' + docString.content + '\n"""'
  }

  handleStepResult(stepResult) {
    if (!(stepResult.step instanceof Hook)) {
      this.storeStepResult(stepResult)
    }
  }

  handleBeforeScenario() {
    this.resetScenarioStepsOutput()
  }

  handleAfterScenario(scenario) {
    let text = ''
    let tagsText = this.formatTags(scenario.tags)
    if (tagsText) {
      text = tagsText + '\n'
    }
    text += indentString(scenario.keyword + ': ' + scenario.name + '\n', 2)

    text += this.scenarioStepsOutput.join('\n')

    this.logIndented(text, 0)
  }

  storeStepResult(stepResult) {
    let result = []
    const {status, step} = stepResult
    const colorFn = this.colorFns[status]
    const symbol = VerboseSummaryFormatter.CHARACTERS[stepResult.status]
    const identifier = colorFn(symbol + ' ' + step.keyword + (step.name || ''))
    this.scenarioStepsOutput = this.scenarioStepsOutput || []
    result.push(indentString(identifier + '\n', 2))

    step.arguments.forEach((arg) => {
      let str
      if (arg instanceof DataTable) {
        str = this.formatDataTable(arg)
      } else if (arg instanceof DocString) {
        str = this.formatDocString(arg)
      } else {
        throw new Error('Unknown argument type: ' + arg)
      }
      result.push(indentString(colorFn(str) + '\n', 6))
    })

    this.scenarioStepsOutput.push(result.join(''))
  }
}

VerboseSummaryFormatter.CHARACTERS = {
  [Status.AMBIGUOUS]: figures.cross,
  [Status.FAILED]: figures.cross,
  [Status.PASSED]: figures.tick,
  [Status.PENDING]: '?',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: '?'
}
