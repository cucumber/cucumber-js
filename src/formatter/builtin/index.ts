import { FormatterImplementation } from '../index'
import JsonFormatter from '../json_formatter'
import RerunFormatter from '../rerun_formatter'
import SnippetsFormatter from '../snippets_formatter'
import UsageFormatter from '../usage_formatter'
import UsageJsonFormatter from '../usage_json_formatter'
import summaryFormatter from './summary'
import prettyFormatter from './pretty'
import progressFormatter from './progress'
import progressBarFormatter from './progress-bar'
import messageFormatter from './message'
import htmlFormatter from './html'

const builtin = {
  // new plugin-based formatters
  html: htmlFormatter,
  junit: '@cucumber/junit-xml-formatter',
  message: messageFormatter,
  pretty: prettyFormatter,
  progress: progressFormatter,
  'progress-bar': progressBarFormatter,
  // legacy class-based formatters
  summary: summaryFormatter,
  json: JsonFormatter,
  rerun: RerunFormatter,
  snippets: SnippetsFormatter,
  usage: UsageFormatter,
  'usage-json': UsageJsonFormatter,
} as const satisfies Record<string, FormatterImplementation | string>

export default builtin as Record<string, FormatterImplementation | string>

export const documentation = {
  // new plugin-based formatters
  html: 'Outputs a HTML report',
  junit: 'Produces a JUnit XML report',
  message: 'Emits Cucumber messages in newline-delimited JSON',
  pretty:
    'Writes a rich report of the scenario and example execution as it happens',
  progress: 'Prints one character per scenario.',
  'progress-bar': 'Provides a real-time updating progress bar',
  summary: 'Summary output of feature and scenarios',
  // legacy class-based formatters
  json: JsonFormatter.documentation,
  rerun: RerunFormatter.documentation,
  snippets: SnippetsFormatter.documentation,
  usage: UsageFormatter.documentation,
  'usage-json': UsageJsonFormatter.documentation,
} satisfies Record<keyof typeof builtin, string>
