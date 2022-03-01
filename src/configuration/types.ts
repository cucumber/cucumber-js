import { IRuntimeOptions } from '../runtime'
import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { PickleOrder } from '../cli/helpers'
import {
  ISupportCodeCoordinates,
  ISupportCodeLibrary,
} from '../support_code_library_builder/types'

export interface ISourcesCoordinates {
  defaultDialect?: string
  paths?: string[]
  names?: string[]
  tagExpression?: string
  order?: PickleOrder
}

export interface IUserConfiguration {
  sources: ISourcesCoordinates
  support: ISupportCodeCoordinates
  runtime?: Partial<IRuntimeOptions> & { parallel?: number }
  formats?: IFormatterConfiguration
}

export interface IRunConfiguration {
  sources: ISourcesCoordinates
  support: ISupportCodeCoordinates | ISupportCodeLibrary
  runtime?: Partial<IRuntimeOptions> & { parallel?: number }
  formats?: IFormatterConfiguration
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
  options?: IParsedArgvFormatOptions
}
