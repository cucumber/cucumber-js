import getColorFns from './get_color_fns'
import JavascriptSnippetSyntax from './step_definition_snippet_builder/javascript_snippet_syntax'
import path from 'path'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import Formatter, { IFormatterCleanupFn, IFormatterLogFn } from '.'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { EventEmitter } from 'events'
import EventDataCollector from './helpers/event_data_collector'
import { Writable as WritableStream } from 'stream'
import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { SnippetInterface } from './step_definition_snippet_builder/snippet_syntax'
import { pathToFileURL } from 'url'
import Formatters from './helpers/formatters'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

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
  async build(type: string, options: IBuildOptions): Promise<Formatter> {
    const FormatterConstructor = await FormatterBuilder.getConstructorByType(
      type,
      options.cwd
    )
    const colorFns = getColorFns(options.parsedArgvOptions.colorsEnabled)
    const snippetBuilder =
      await FormatterBuilder.getStepDefinitionSnippetBuilder({
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

  async getConstructorByType(
    type: string,
    cwd: string
  ): Promise<typeof Formatter> {
    const formatters: Record<string, typeof Formatter> =
      Formatters.getFormatters()

    return formatters[type]
      ? formatters[type]
      : await FormatterBuilder.loadCustomClass('formatter', type, cwd)
  },

  async getStepDefinitionSnippetBuilder({
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
      Syntax = await FormatterBuilder.loadCustomClass(
        'syntax',
        snippetSyntax,
        cwd
      )
    }
    return new StepDefinitionSnippetBuilder({
      snippetSyntax: new Syntax(snippetInterface),
      parameterTypeRegistry: supportCodeLibrary.parameterTypeRegistry,
    })
  },

  async loadCustomClass(
    type: 'formatter' | 'syntax',
    descriptor: string,
    cwd: string
  ) {
    let CustomClass = descriptor.startsWith(`.`)
      ? await importer(pathToFileURL(path.resolve(cwd, descriptor)))
      : await importer(descriptor)
    CustomClass = FormatterBuilder.resolveConstructor(CustomClass)
    if (doesHaveValue(CustomClass)) {
      return CustomClass
    } else {
      throw new Error(
        `Custom ${type} (${descriptor}) does not export a function/class`
      )
    }
  },

  resolveConstructor(ImportedCode: any) {
    if (typeof ImportedCode === 'function') {
      return ImportedCode
    } else if (
      doesHaveValue(ImportedCode) &&
      typeof ImportedCode.default === 'function'
    ) {
      return ImportedCode.default
    }
    return null
  },
}

export default FormatterBuilder
