import { FormatterImplementation } from '../index'
import JsonFormatter from '../json_formatter'
import ProgressFormatter from '../progress_formatter'
import ProgressBarFormatter from '../progress_bar_formatter'
import RerunFormatter from '../rerun_formatter'
import SnippetsFormatter from '../snippets_formatter'
import SummaryFormatter from '../summary_formatter'
import UsageFormatter from '../usage_formatter'
import UsageJsonFormatter from '../usage_json_formatter'
import JunitFormatter from '../junit_formatter'
import messageFormatter from './message'
import htmlFormatter from './html'

const builtin: Record<string, FormatterImplementation> = {
  // new plugin-based formatters
  html: htmlFormatter,
  message: messageFormatter,
  // legacy class-based formatters
  json: JsonFormatter,
  progress: ProgressFormatter,
  'progress-bar': ProgressBarFormatter,
  rerun: RerunFormatter,
  snippets: SnippetsFormatter,
  summary: SummaryFormatter,
  usage: UsageFormatter,
  'usage-json': UsageJsonFormatter,
  junit: JunitFormatter,
}

export default builtin
