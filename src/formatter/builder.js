import _ from 'lodash'
import getColorFns from './get_color_fns'
import JavascriptSnippetSyntax from './step_definition_snippet_builder/javascript_snippet_syntax'
import JsonFormatter from './json_formatter'
import path from 'path'
import PrettyFormatter from './pretty_formatter'
import ProgressFormatter from './progress_formatter'
import RerunFormatter from './rerun_formatter'
import SnippetsFormatter from './snippets_formatter'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import SummaryFormatter from './summary_formatter'

export default class FormatterBuilder {
  static build(type, options) {
    const Formatter = FormatterBuilder.getConstructorByType(type, options)
    const extendedOptions = _.assign({}, options, {
      colorFns: getColorFns(options.colorsEnabled),
      snippetBuilder: FormatterBuilder.getStepDefinitionSnippetBuilder(options)
    })
    return new Formatter(extendedOptions)
  }

  static getConstructorByType(type, options) {
    switch(type) {
      case 'json': return JsonFormatter
      case 'pretty': return PrettyFormatter
      case 'progress': return ProgressFormatter
      case 'rerun': return RerunFormatter
      case 'snippets': return SnippetsFormatter
      case 'summary': return SummaryFormatter
      default: return FormatterBuilder.loadCustomFormatter(type, options)
    }
  }

  static getStepDefinitionSnippetBuilder({cwd, snippetInterface, snippetSyntax, supportCodeLibrary}) {
    if (!snippetInterface) {
      snippetInterface = 'callback'
    }
    let Syntax = JavascriptSnippetSyntax
    if (snippetSyntax) {
      const fullSyntaxPath = path.resolve(cwd, snippetSyntax)
      Syntax = require(fullSyntaxPath)
    }
    return new StepDefinitionSnippetBuilder({
      snippetSyntax: new Syntax(snippetInterface),
      transformLookup: supportCodeLibrary.transformLookup
    })
  }

  static loadCustomFormatter(customFormatterPath, {cwd}) {
    const fullCustomFormatterPath = path.resolve(cwd, customFormatterPath)
    const CustomFormatter = require(fullCustomFormatterPath)
    if (typeof(CustomFormatter) === 'function') {
      return CustomFormatter
    } else if (CustomFormatter && typeof(CustomFormatter.default) === 'function') {
      return CustomFormatter.default
    } else {
      throw new Error(`Custom formatter (${customFormatterPath}) does not export a function`)
    }
  }
}
