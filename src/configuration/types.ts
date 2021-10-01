import { IFormatterConfiguration } from '../formatter'
import { IRuntimeOptions } from '../runtime'

export interface IRunConfiguration {
  sources: {
    defaultDialect?: string
    paths: string[]
  }
  pickles?: {
    order?: string
    names?: string[]
    tagExpression?: string
  }
  support: {
    transpileWith: string[]
    paths: string[]
  }
  runtime: IRuntimeOptions
  formats?: IFormatterConfiguration
}
