import path from 'node:path'
import { EventEmitter } from 'node:events'
import { Writable as WritableStream } from 'node:stream'
import { pathToFileURL } from 'node:url'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { SnippetInterface } from './step_definition_snippet_builder/snippet_syntax'
import EventDataCollector from './helpers/event_data_collector'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import JavascriptSnippetSyntax from './step_definition_snippet_builder/javascript_snippet_syntax'
import getColorFns from './get_color_fns'
import Formatters from './helpers/formatters'
import Formatter, {
  FormatOptions,
  IFormatterCleanupFn,
  IFormatterLogFn,
} from '.'

interface IGetStepDefinitionSnippetBuilderOptions {
  cwd: string
  snippetInterface?: SnippetInterface
  snippetSyntax?: string
  supportCodeLibrary: SupportCodeLibrary
}

export interface IBuildOptions {
  env: NodeJS.ProcessEnv
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  log: IFormatterLogFn
  parsedArgvOptions: FormatOptions
  stream: WritableStream
  cleanup: IFormatterCleanupFn
  supportCodeLibrary: SupportCodeLibrary
}

const FormatterBuilder = {
  async build(type: string, options: IBuildOptions): Promise<Formatter> {
    const FormatterConstructor = await FormatterBuilder.getConstructorByType(
      type,
      options.cwd
    )
    const colorFns = getColorFns(
      options.stream,
      options.env,
      options.parsedArgvOptions.colorsEnabled
    )
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
    let normalized: URL | string = descriptor
    if (descriptor.startsWith('.')) {
      normalized = pathToFileURL(path.resolve(cwd, descriptor))
    } else if (descriptor.startsWith('file://')) {
      normalized = new URL(descriptor)
    }
    let CustomClass = await FormatterBuilder.loadFile(normalized)
    CustomClass = FormatterBuilder.resolveConstructor(CustomClass)
    if (doesHaveValue(CustomClass)) {
      return CustomClass
    } else {
      throw new Error(
        `Custom ${type} (${descriptor}) does not export a function/class`
      )
    }
  },

  async loadFile(urlOrName: URL | string) {
    return await import(urlOrName.toString())
  },

  resolveConstructor(ImportedCode: any) {
    if (doesNotHaveValue(ImportedCode)) {
      return null
    }
    if (typeof ImportedCode === 'function') {
      return ImportedCode
    } else if (
      typeof ImportedCode === 'object' &&
      typeof ImportedCode.default === 'function'
    ) {
      return ImportedCode.default
    } else if (
      typeof ImportedCode.default === 'object' &&
      typeof ImportedCode.default.default === 'function'
    ) {
      return ImportedCode.default.default
    }
    return null
  },
}

export default FormatterBuilder
