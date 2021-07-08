import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'

export interface IRunParameters {
  gherkin: {
    defaultDialect: string
  }
  pickles: {
    paths: string[]
    names?: string[]
    tagExpression?: string
  }
  support:
    | {
        transpileWith?: string[]
        paths: string[]
      }
    | ISupportCodeLibrary
  runtime: {
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
    strict: boolean
    worldParameters?: any
  }
  formats: {
    stdout: string
    files: Record<string, string>
    options: IParsedArgvFormatOptions
  }
}

export interface IRunResult {
  success: boolean
  support: ISupportCodeLibrary
}

export async function runCucumber(
  options: IRunParameters
): Promise<IRunResult> {
  return null
}
