import type { EventEmitter } from 'node:events'
import type { Writable } from 'node:stream'
import type { FormatCodeFunction, Theme } from '@cucumber/pretty-formatter'
import type { FormatterPlugin } from '../plugin'
import type { SupportCodeLibrary } from '../support_code_library_builder/types'
import { valueOrDefault } from '../value_checker'
import type { IColorFns } from './get_color_fns'
import type { EventDataCollector } from './helpers'
import type StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import type { SnippetInterface } from './step_definition_snippet_builder/snippet_syntax'

export type { FormatCodeFunction, Theme } from '@cucumber/pretty-formatter'

export interface FormatOptions {
  /**
   * @deprecated use `FORCE_COLOR` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
   */
  colorsEnabled?: boolean
  html?: {
    externalAttachments?: boolean | ReadonlyArray<string>
  }
  includeAttachments?: boolean
  pretty?: {
    includeFeatureLine?: boolean
    includeRuleLine?: boolean
    useStatusIcon?: boolean
    formatCode?: FormatCodeFunction
  }
  /**
   * @deprecated alias for `includeAttachments`; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
   */
  printAttachments?: boolean
  rerun?: {
    separator?: string
  }
  snippetInterface?: SnippetInterface
  snippetSyntax?: string
  theme?: Theme
  // biome-ignore lint/suspicious/noExplicitAny: custom formatter options are arbitrary and read directly by formatter code
  [customKey: string]: any
}

export type FormatterImplementation = typeof Formatter | FormatterPlugin
export type IFormatterStream = Writable
export type IFormatterLogFn = (buffer: string | Uint8Array) => void
export type IFormatterCleanupFn = () => Promise<unknown>

export interface IFormatterOptions {
  colorFns: IColorFns
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  log: IFormatterLogFn
  parsedArgvOptions: FormatOptions
  snippetBuilder: StepDefinitionSnippetBuilder
  stream: Writable
  cleanup: IFormatterCleanupFn
  supportCodeLibrary: SupportCodeLibrary
}

export default class Formatter {
  protected colorFns: IColorFns
  protected cwd: string
  protected eventDataCollector: EventDataCollector
  protected log: IFormatterLogFn
  protected snippetBuilder: StepDefinitionSnippetBuilder
  protected stream: Writable
  protected supportCodeLibrary: SupportCodeLibrary
  protected printAttachments: boolean
  private readonly cleanup: IFormatterCleanupFn
  static readonly documentation: string

  constructor(options: IFormatterOptions) {
    this.colorFns = options.colorFns
    this.cwd = options.cwd
    this.eventDataCollector = options.eventDataCollector
    this.log = options.log
    this.snippetBuilder = options.snippetBuilder
    this.stream = options.stream
    this.supportCodeLibrary = options.supportCodeLibrary
    this.cleanup = options.cleanup
    this.printAttachments = valueOrDefault(
      options.parsedArgvOptions.includeAttachments ?? options.parsedArgvOptions.printAttachments,
      true
    )
  }

  async finished(): Promise<void> {
    await this.cleanup()
  }
}
