import { IRuntimeOptions } from '../runtime'
import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { PickleOrder } from '../cli/helpers'

export interface IRunConfiguration {
  sources: {
    defaultDialect?: string
    paths?: string[]
    names?: string[]
    tagExpression?: string
    order?: PickleOrder
  }
  support: {
    transpileWith: string[]
    paths: string[]
  }
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
