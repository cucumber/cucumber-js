import _ from 'lodash'
import { IColorFns } from './get_color_fns'
import { EventDataCollector } from './helpers'
import StepDefinitionSnippetBuilder from './step_definition_snippet_builder'
import { Writable as WritableStream } from 'stream'
import { ISupportCodeLibrary } from '../support_code_library_builder'
import { WriteStream as FsWriteStream } from 'fs'
import { WriteStream as TtyWriteStream } from 'tty'

export type IFormatterStream = FsWriteStream | TtyWriteStream
export type IFormatterLogFn = (buffer: string | Uint8Array) => void

export interface IFormatterOptions {
  colorFns: IColorFns
  cwd: string
  eventDataCollector: EventDataCollector
  log: IFormatterLogFn
  snippetBuilder: StepDefinitionSnippetBuilder
  stream: WritableStream
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

  constructor(options: IFormatterOptions) {
    this.colorFns = options.colorFns
    this.cwd = options.cwd
    this.eventDataCollector = options.eventDataCollector
    this.log = options.log
    this.snippetBuilder = options.snippetBuilder
    this.stream = options.stream
    this.supportCodeLibrary = options.supportCodeLibrary
  }
}
