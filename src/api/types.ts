import {
  ISupportCodeCoordinates,
  ISupportCodeLibrary,
} from '../support_code_library_builder/types'
import { FormatOptions, IFormatterStream } from '../formatter'
import { PickleOrder } from '../models/pickle_order'
import { IRuntimeOptions } from '../runtime'

export interface ISourcesCoordinates {
  defaultDialect?: string
  paths?: string[]
  names?: string[]
  tagExpression?: string
  order?: PickleOrder
}

export interface IFormatterConfiguration {
  stdout?: string
  files?: Record<string, string>
  publish?:
    | {
        url?: string
        token?: string
      }
    | false
  options?: FormatOptions
}

export interface IRunConfiguration {
  sources: ISourcesCoordinates
  support: ISupportCodeCoordinates | ISupportCodeLibrary
  runtime?: Partial<IRuntimeOptions> & { parallel?: number }
  formats?: IFormatterConfiguration
}

export interface IRunEnvironment {
  cwd: string
  stdout: IFormatterStream
  stderr: IFormatterStream
  env: NodeJS.ProcessEnv
}

export interface IRunResult {
  success: boolean
  support: ISupportCodeLibrary
}
