import { IFormatterConfiguration } from '../formatter'

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
  support?: {
    transpileWith?: string[]
    paths: string[]
  }
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
  formats?: IFormatterConfiguration
}
