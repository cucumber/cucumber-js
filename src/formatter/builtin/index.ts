import { FormatterImplementation } from '../index'
import JsonFormatter from '../json_formatter'
import ProgressFormatter from '../progress_formatter'
import ProgressBarFormatter from '../progress_bar_formatter'
import RerunFormatter from '../rerun_formatter'
import SnippetsFormatter from '../snippets_formatter'
import SummaryFormatter from '../summary_formatter'
import UsageFormatter from '../usage_formatter'
import UsageJsonFormatter from '../usage_json_formatter'
import messageFormatter from './message'
import htmlFormatter from './html'

const builtin = {
  // new plugin-based formatters
  html: htmlFormatter,
  junit: '@cucumber/junit-xml-formatter',
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
} as const satisfies Record<string, FormatterImplementation | string>

export default builtin as Record<string, FormatterImplementation | string>

export const documentation = {
  // new plugin-based formatters
  html: 'Outputs a HTML report',
  junit: 'Produces a JUnit XML report',
  message: 'Emits Cucumber messages in newline-delimited JSON',
  // legacy class-based formatters
  json: JsonFormatter.documentation,
  progress: ProgressFormatter.documentation,
  'progress-bar': ProgressBarFormatter.documentation,
  rerun: RerunFormatter.documentation,
  snippets: SnippetsFormatter.documentation,
  summary: SummaryFormatter.documentation,
  usage: UsageFormatter.documentation,
  'usage-json': UsageJsonFormatter.documentation,
} satisfies Record<keyof typeof builtin, string>
