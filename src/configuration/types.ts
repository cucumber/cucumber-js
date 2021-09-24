import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { IFormatterStream } from '../formatter'

export interface IRunConfiguration {
  cwd: string
  features: {
    defaultDialect?: string
    paths: string[]
  }
  filters?: {
    name?: string[]
    tagExpression?: string
  }
  support?:
    | {
        transpileWith?: string[]
        paths: string[]
      }
    | ISupportCodeLibrary
  runtime?: {
    dryRun?: boolean
    failFast?: boolean
    filterStacktraces?: boolean
    parallel?: {
      count: number
    }
    retry?: {
      count: number
      tagExpression?: string
    }
    strict?: boolean
    worldParameters?: any
  }
  formats?: {
    toOutputStream: string
    files?: Record<string, string>
    options?: IParsedArgvFormatOptions
  }
  outputStream: IFormatterStream
}
