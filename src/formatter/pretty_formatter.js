import DataTable from '../models/step_arguments/data_table'
import DocString from '../models/step_arguments/doc_string'
import figures from 'figures'
import Hook from '../models/hook'
import Status from '../status'
import SummaryFormatter from './summary_formatter'
import Table from 'cli-table'
import indentString from 'indent-string'

export default class PrettyFormatter extends SummaryFormatter {
  applyColor(stepResult, text) {
    const status = stepResult.status
    return this.colorFns[status](text)
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

  formatTags(tags) {
    if (tags.length === 0) {
      return ''
    }
    const tagNames = tags.map((tag) => tag.name)
    return this.colorFns.tag(tagNames.join(' '))
  }

  handleAfterScenario() {
    this.log('\n')
  }

  handleBeforeScenario(scenario) {
    let text = ''
    let tagsText = this.formatTags(scenario.tags)
    if (tagsText) {
      text = tagsText + '\n'
    }
    text += scenario.keyword + ': ' + scenario.name
    this.logIndented(text + '\n', 1)
  }

  handleStepResult(stepResult) {
    if (!(stepResult.step instanceof Hook)) {
      this.logStepResult(stepResult)
    }
  }

  logIndented(text, level) {
    this.log(indentString(text, level * 2))
  }

  logStepResult(stepResult) {
    const {status, step} = stepResult
    const colorFn = this.colorFns[status]

    const symbol = PrettyFormatter.CHARACTERS[stepResult.status]
    const identifier = colorFn(symbol + ' ' + step.keyword + (step.name || ''))
    this.logIndented(identifier + '\n', 1)

    step.arguments.forEach((arg) => {
      let str
      if (arg instanceof DataTable) {
        str = this.formatDataTable(arg)
      } else if (arg instanceof DocString) {
        str = this.formatDocString(arg)
      } else {
        throw new Error('Unknown argument type: ' + arg)
      }
      this.logIndented(colorFn(str) + '\n', 3)
    })
  }
}

PrettyFormatter.CHARACTERS = {
  [Status.AMBIGUOUS]: figures.cross,
  [Status.FAILED]: figures.cross,
  [Status.PASSED]: figures.tick,
  [Status.PENDING]: '?',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: '?'
}
