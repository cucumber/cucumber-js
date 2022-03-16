import {
  ISupportCodeCoordinates,
  ISupportCodeLibrary,
} from '../support_code_library_builder/types'
import { FormatOptions, IFormatterStream } from '../formatter'
import { PickleOrder } from '../models/pickle_order'
import { IRuntimeOptions } from '../runtime'
import { IConfiguration } from '../configuration'

export interface ISourcesCoordinates {
  defaultDialect: string
  paths: string[]
  names: string[]
  tagExpression: string
  order: PickleOrder
}

export interface IRunOptionsRuntime extends IRuntimeOptions {
  parallel: number
}

export interface IRunOptionsFormats {
  stdout: string
  files: Record<string, string>
  publish:
    | {
        url?: string
        token?: string
      }
    | false
  options: FormatOptions
}

export interface IRunnableConfiguration {
  sources: ISourcesCoordinates
  support: ISupportCodeCoordinates
  runtime: IRunOptionsRuntime
  formats: IRunOptionsFormats
}

export interface IRunConfiguration {
  sources: ISourcesCoordinates
  support: ISupportCodeCoordinates | ISupportCodeLibrary
  runtime: IRunOptionsRuntime
  formats: IRunOptionsFormats
}

export interface IRunEnvironment {
  /**
   * Working directory for the project (defaults to `process.cwd()` if omitted)
   */
  cwd?: string
  /**
   * Writable stream where the test run's main output is written (defaults to `process.stdout` if omitted)
   */
  stdout?: IFormatterStream
  /**
   * Writable stream where the test run's warning/error output is written (defaults to `process.stderr` if omitted)
   */
  stderr?: IFormatterStream
  /**
   * Environment variables (defaults to `process.env` if omitted)
   */
  env?: NodeJS.ProcessEnv
}

export interface IResolvedConfiguration {
  original: IConfiguration
  runnable: IRunnableConfiguration
}

export interface IRunResult {
  success: boolean
  support: ISupportCodeLibrary
}
