import EventProtocolFormatter from './event_protocol_formatter'
import getColorFns from './get_color_fns'
import JavascriptSnippetSyntax from './step_definition_snippet_builder/javascript_snippet_syntax'
import JsonFormatter from './json_formatter'
import path from 'path'
import ProgressBarFormatter from './progress_bar_formatter'
import ProgressFormatter from './progress_formatter'
import RerunFormatter from './rerun_formatter'
import SnippetsFormatter from './snippets_formatter'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import SummaryFormatter from './summary_formatter'
import UsageFormatter from './usage_formatter'
import UsageJsonFormatter from './usage_json_formatter'

export default class FormatterBuilder {
  static build(type, options) {
    const Formatter = FormatterBuilder.getConstructorByType(type, options)
    const extendedOptions = {
      colorFns: getColorFns(options.colorsEnabled),
      snippetBuilder: FormatterBuilder.getStepDefinitionSnippetBuilder(options),
      ...options,
    }
    return new Formatter(extendedOptions)
  }

  static getConstructorByType(type, options) {
    switch (type) {
      case 'event-protocol':
        return EventProtocolFormatter
      case 'json':
        return JsonFormatter
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
  }

  static getStepDefinitionSnippetBuilder({
    cwd,
    snippetInterface,
    snippetSyntax,
    supportCodeLibrary,
  }) {
    if (!snippetInterface) {
      snippetInterface = 'synchronous'
    }
    let Syntax = JavascriptSnippetSyntax
    if (snippetSyntax) {
      const fullSyntaxPath = path.resolve(cwd, snippetSyntax)
      Syntax = require(fullSyntaxPath)
    }
    return new StepDefinitionSnippetBuilder({
      snippetSyntax: new Syntax(snippetInterface),
      parameterTypeRegistry: supportCodeLibrary.parameterTypeRegistry,
    })
  }

  static loadCustomFormatter(customFormatterPath, { cwd }) {
    const fullCustomFormatterPath = path.resolve(cwd, customFormatterPath)
    const CustomFormatter = require(fullCustomFormatterPath)
    if (typeof CustomFormatter === 'function') {
      return CustomFormatter
    } else if (
      CustomFormatter &&
      typeof CustomFormatter.default === 'function'
    ) {
      return CustomFormatter.default
    }
    throw new Error(
      `Custom formatter (${customFormatterPath}) does not export a function`
    )
  }
}
