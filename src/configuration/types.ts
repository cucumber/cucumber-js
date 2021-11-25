import { IRuntimeOptions } from '../runtime'
import { IParsedArgvFormatOptions } from '../cli/argv_parser'

export interface IRunConfiguration {
  sources: {
    defaultDialect?: string
    paths?: string[]
    names?: string[]
    tagExpression?: string
    order?: string // TODO make me an enum?
  }
  support: {
    transpileWith: string[]
    paths: string[]
  }
  runtime: IRuntimeOptions & { parallel: number }
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
