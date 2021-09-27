import getColorFns from './get_color_fns'
import JavascriptSnippetSyntax from './step_definition_snippet_builder/javascript_snippet_syntax'
import JsonFormatter from './json_formatter'
import MessageFormatter from './message_formatter'
import path from 'path'
import ProgressBarFormatter from './progress_bar_formatter'
import ProgressFormatter from './progress_formatter'
import RerunFormatter from './rerun_formatter'
import SnippetsFormatter from './snippets_formatter'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import SummaryFormatter from './summary_formatter'
import UsageFormatter from './usage_formatter'
import UsageJsonFormatter from './usage_json_formatter'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import Formatter, { IFormatterCleanupFn, IFormatterLogFn } from '.'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { EventEmitter } from 'events'
import EventDataCollector from './helpers/event_data_collector'
import { Writable as WritableStream } from 'stream'
import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { SnippetInterface } from './step_definition_snippet_builder/snippet_syntax'
import HtmlFormatter from './html_formatter'
import createRequire from 'create-require'

interface IGetStepDefinitionSnippetBuilderOptions {
  cwd: string
  snippetInterface?: SnippetInterface
  snippetSyntax?: string
  supportCodeLibrary: ISupportCodeLibrary
}

export interface IBuildOptions {
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  log: IFormatterLogFn
  parsedArgvOptions: IParsedArgvFormatOptions
  stream: WritableStream
  cleanup: IFormatterCleanupFn
  supportCodeLibrary: ISupportCodeLibrary
}

const FormatterBuilder = {
  build(type: string, options: IBuildOptions): Formatter {
    const FormatterConstructor = FormatterBuilder.getConstructorByType(
      type,
      options.cwd
    )
    const colorFns = getColorFns(options.parsedArgvOptions.colorsEnabled)
    const snippetBuilder = FormatterBuilder.getStepDefinitionSnippetBuilder({
      cwd: options.cwd,
      snippetInterface: options.parsedArgvOptions.snippetInterface,
      snippetSyntax: options.parsedArgvOptions.snippetSyntax,
      supportCodeLibrary: options.supportCodeLibrary,
    })
    return new FormatterConstructor({
      colorFns,
      snippetBuilder,
      ...options,
    })
  },

  getConstructorByType(type: string, cwd: string): typeof Formatter {
    const formatters: Record<string, typeof Formatter> = {
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

    return formatters[type]
      ? formatters[type]
      : FormatterBuilder.loadCustomFormatter(type, cwd)
  },

  getStepDefinitionSnippetBuilder({
    cwd,
    snippetInterface,
    snippetSyntax,
    supportCodeLibrary,
  }: IGetStepDefinitionSnippetBuilderOptions) {
    if (doesNotHaveValue(snippetInterface)) {
      snippetInterface = SnippetInterface.Synchronous
    }
    let Syntax = JavascriptSnippetSyntax
    if (doesHaveValue(snippetSyntax)) {
      const fullSyntaxPath = path.resolve(cwd, snippetSyntax)
      Syntax = require(fullSyntaxPath) // eslint-disable-line @typescript-eslint/no-var-requires
    }
    return new StepDefinitionSnippetBuilder({
      snippetSyntax: new Syntax(snippetInterface),
      parameterTypeRegistry: supportCodeLibrary.parameterTypeRegistry,
    })
  },

  loadCustomFormatter(customFormatterPath: string, cwd: string) {
    const CustomFormatter = createRequire(cwd)(customFormatterPath)

    if (typeof CustomFormatter === 'function') {
      return CustomFormatter
    } else if (
      doesHaveValue(CustomFormatter) &&
      typeof CustomFormatter.default === 'function'
    ) {
      return CustomFormatter.default
    }
    throw new Error(
      `Custom formatter (${customFormatterPath}) does not export a function`
    )
  },
}

export default FormatterBuilder
