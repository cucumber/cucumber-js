import { IRuntimeOptions } from '../runtime'
import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { PickleOrder } from '../cli/helpers'
import { ISupportCodeCoordinates } from '../support_code_library_builder/types'

export interface IRunConfiguration {
  sources: {
    defaultDialect?: string
    paths?: string[]
    names?: string[]
    tagExpression?: string
    order?: PickleOrder
  }
  support: ISupportCodeCoordinates
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
