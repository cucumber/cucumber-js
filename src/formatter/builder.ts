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
import { ISupportCodeLibrary } from '../support_code_library_builder'
import Formatter from '.'
import { doesNotHaveValue, doesHaveValue } from '../value_checker'

interface IGetStepDefinitionSnippetBuilderOptions {
  cwd: string
  snippetInterface?: string
  snippetSyntax?: string
  supportCodeLibrary: ISupportCodeLibrary
}

const FormatterBuilder = {
  build(type, options): Formatter {
    const FormatterConstructor = FormatterBuilder.getConstructorByType(
      type,
      options
    )
    const extendedOptions = {
      colorFns: getColorFns(options.colorsEnabled),
      snippetBuilder: FormatterBuilder.getStepDefinitionSnippetBuilder(options),
      ...options,
    }
    return new FormatterConstructor(extendedOptions)
  },

  getConstructorByType(type, options): typeof Formatter {
    switch (type) {
      case 'json':
        return JsonFormatter
      case 'message':
        return MessageFormatter
      case 'progress':
        return ProgressFormatter
      case 'progress-bar':
        return ProgressBarFormatter
      case 'rerun':
        return RerunFormatter
      case 'snippets':
        return SnippetsFormatter
      case 'summary':
        return SummaryFormatter
      case 'usage':
        return UsageFormatter
      case 'usage-json':
        return UsageJsonFormatter
      default:
        return FormatterBuilder.loadCustomFormatter(type, options)
    }
  },

  getStepDefinitionSnippetBuilder({
    cwd,
    snippetInterface,
    snippetSyntax,
    supportCodeLibrary,
  }: IGetStepDefinitionSnippetBuilderOptions) {
    if (doesNotHaveValue(snippetInterface)) {
      snippetInterface = 'synchronous'
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

  loadCustomFormatter(customFormatterPath, { cwd }) {
    const fullCustomFormatterPath = path.resolve(cwd, customFormatterPath)
    const CustomFormatter = require(fullCustomFormatterPath) // eslint-disable-line @typescript-eslint/no-var-requires
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
