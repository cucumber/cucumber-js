import { Writable } from 'node:stream'
import { EventEmitter } from 'node:events'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { valueOrDefault } from '../value_checker'
import { FormatterPlugin } from '../plugin'
import { IColorFns } from './get_color_fns'
import { EventDataCollector } from './helpers'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import { SnippetInterface } from './step_definition_snippet_builder/snippet_syntax'

export interface FormatRerunOptions {
  separator?: string
}

export interface FormatOptions {
  colorsEnabled?: boolean
  rerun?: FormatRerunOptions
  snippetInterface?: SnippetInterface
  snippetSyntax?: string
  printAttachments?: boolean
  [customKey: string]: any
}

export type FormatterImplementation = typeof Formatter | FormatterPlugin
export type IFormatterStream = Writable
export type IFormatterLogFn = (buffer: string | Uint8Array) => void
export type IFormatterCleanupFn = () => Promise<any>

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
      options.parsedArgvOptions.printAttachments,
      true
    )
  }

  async finished(): Promise<void> {
    await this.cleanup()
  }
}
