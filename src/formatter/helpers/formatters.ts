import Formatter from '../.'
import JsonFormatter from '../json_formatter'
import MessageFormatter from '../message_formatter'
import ProgressBarFormatter from '../progress_bar_formatter'
import ProgressFormatter from '../progress_formatter'
import RerunFormatter from '../rerun_formatter'
import SnippetsFormatter from '../snippets_formatter'
import SummaryFormatter from '../summary_formatter'
import UsageFormatter from '../usage_formatter'
import UsageJsonFormatter from '../usage_json_formatter'
import HtmlFormatter from '../html_formatter'

const Formatters = {
  getFormatters(): Record<string, typeof Formatter> {
    return {
      json: JsonFormatter,
      message: MessageFormatter,
      html: HtmlFormatter,
      progress: ProgressFormatter,
      'progress-bar': ProgressBarFormatter,
      rerun: RerunFormatter,
      snippets: SnippetsFormatter,
      summary: SummaryFormatter,
      usage: UsageFormatter,
      'usage-json': UsageJsonFormatter,
    }
  },
  buildFormattersDocumentationString(): string {
    let concatanatedFormattersDocumentation: string = ''
    const formatters = this.getFormatters()
    for (const formatterName in formatters) {
      concatanatedFormattersDocumentation += `    ${formatterName}: ${formatters[formatterName].documentation}\n`
    }

    return concatanatedFormattersDocumentation
  },
}

export default Formatters
