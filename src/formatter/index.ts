import { IColorFns } from './get_color_fns'
import { EventDataCollector } from './helpers'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import { PassThrough, Writable as WritableStream } from 'stream'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { WriteStream as FsWriteStream } from 'fs'
import { WriteStream as TtyWriteStream } from 'tty'
import { EventEmitter } from 'events'
import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import HttpStream from './http_stream'

export type IFormatterStream =
  | FsWriteStream
  | TtyWriteStream
  | PassThrough
  | HttpStream
export type IFormatterLogFn = (buffer: string | Uint8Array) => void
export type IFormatterCleanupFn = () => Promise<any>

export interface IFormatterOptions {
  colorFns: IColorFns
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  log: IFormatterLogFn
  parsedArgvOptions: IParsedArgvFormatOptions
  snippetBuilder: StepDefinitionSnippetBuilder
  stream: WritableStream
  cleanup: IFormatterCleanupFn
  supportCodeLibrary: ISupportCodeLibrary
}

export default class Formatter {
  protected colorFns: IColorFns
  protected cwd: string
  protected eventDataCollector: EventDataCollector
  protected log: IFormatterLogFn
  protected snippetBuilder: StepDefinitionSnippetBuilder
  protected stream: WritableStream
  protected supportCodeLibrary: ISupportCodeLibrary
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
  }

  async finished(): Promise<void> {
    await this.cleanup()
  }
}
