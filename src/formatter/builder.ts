import getColorFns from './get_color_fns'
import JavascriptSnippetSyntax from './step_definition_snippet_builder/javascript_snippet_syntax'
import path from 'path'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import Formatter, {
  FormatOptions,
  IFormatterCleanupFn,
  IFormatterLogFn,
} from '.'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { EventEmitter } from 'events'
import EventDataCollector from './helpers/event_data_collector'
import { Writable as WritableStream } from 'stream'
import { SnippetInterface } from './step_definition_snippet_builder/snippet_syntax'
import { fileURLToPath, pathToFileURL } from 'url'
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
  env: NodeJS.ProcessEnv
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  log: IFormatterLogFn
  parsedArgvOptions: FormatOptions
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
    let normalised: URL | string = descriptor
    if (descriptor.startsWith('.')) {
      normalised = pathToFileURL(path.resolve(cwd, descriptor))
    } else if (descriptor.startsWith('file://')) {
      normalised = new URL(descriptor)
    }
    let CustomClass = await FormatterBuilder.loadFile(normalised)
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
    let result
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      result = require(typeof urlOrName === 'string'
        ? urlOrName
        : fileURLToPath(urlOrName))
    } catch (error) {
      if (error.code === 'ERR_REQUIRE_ESM') {
        result = await importer(urlOrName)
      } else {
        throw error
      }
    }
    return result
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
    }
    return null
  },
}

export default FormatterBuilder
