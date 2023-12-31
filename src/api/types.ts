import { Writable } from 'node:stream'
import { JsonObject } from 'type-fest'
import { IPublishConfig } from '../publish'
import { IConfiguration } from '../configuration'
import { IPickleOrder } from '../filter'

/**
 * @public
 */
export interface ILoadConfigurationOptions {
  /**
   * Path to load configuration file from (defaults to `cucumber.(json|yaml|yml|js|cjs|mjs)` if omitted)
   */
  file?: string
  /**
   * Zero or more profile names from which to source configuration (if omitted or empty, the `default` profile will be used)
   */
  profiles?: string[]
  /**
   * Ad-hoc configuration options to be applied over the top of whatever is loaded from the configuration file/profiles
   */
  provided?: Partial<IConfiguration>
}

/**
 * @public
 */
export interface IResolvedConfiguration {
  /**
   * The final flat configuration object resolved from the configuration file/profiles plus any extra provided
   */
  useConfiguration: IConfiguration
  /**
   * The format that can be passed into {@link runCucumber}
   */
  runConfiguration: IRunConfiguration
}

/**
 * @public
 */
export interface ISourcesCoordinates {
  defaultDialect: string
  paths: string[]
  names: string[]
  tagExpression: string
  order: IPickleOrder
}

/**
 * @public
 */
export interface IPlannedPickle {
  name: string
  uri: string
  location: {
    line: number
    column?: number
  }
}

/**
 * @public
 */
export interface ISourcesError {
  uri: string
  location: {
    line: number
    column?: number
  }
  message: string
}

/**
 * @public
 */
export interface ILoadSourcesResult {
  plan: IPlannedPickle[]
  errors: ISourcesError[]
}

/**
 * @public
 */
export interface ISupportCodeCoordinates {
  requireModules: string[]
  requirePaths: string[]
  importPaths: string[]
}

/**
 * @public
 */
export interface ILoadSupportOptions {
  sources: ISourcesCoordinates
  support: ISupportCodeCoordinates
}

/**
 * @public
 */
export interface IRunOptionsRuntime {
  dryRun: boolean
  failFast: boolean
  filterStacktraces: boolean
  parallel: number
  retry: number
  retryTagFilter: string
  strict: boolean
  worldParameters: JsonObject
}

/**
 * @public
 */
export interface IRunOptionsFormats {
  stdout: string
  files: Record<string, string>
  publish: IPublishConfig | false
  options: JsonObject
}

/**
 * @public
 */
export interface IRunConfiguration {
  sources: ISourcesCoordinates
  support: ISupportCodeCoordinates
  runtime: IRunOptionsRuntime
  formats: IRunOptionsFormats
}

/**
 * A collection of user-defined code and setup that can be used for a test run
 *
 * @public
 * @remarks
 * This is mostly a marker interface. The actual instance is a complex object that you shouldn't
 * interact with directly, but some functions return and/or accept it as a means of optimising
 * your test workflow.
 */
export interface ISupportCodeLibrary {
  readonly originalCoordinates: ISupportCodeCoordinates
}

/**
 * @public
 */
export type ISupportCodeCoordinatesOrLibrary =
  | ISupportCodeCoordinates
  | ISupportCodeLibrary

/**
 * @public
 */
export interface IRunOptions {
  sources: ISourcesCoordinates
  support: ISupportCodeCoordinatesOrLibrary
  runtime: IRunOptionsRuntime
  formats: IRunOptionsFormats
}

/**
 * Contextual data about the project environment
 *
 * @public
 * @remarks
 * These values are important for things like where to look for files, and where to emit output.\
 * Where you are required to *provide* an environment, any/all properties can be safely omitted and will fall
 * back to the default values. Conversely, where you are *supplied* an environment, it will always be a
 * fully-populated value.
 */
export interface IRunEnvironment {
  /**
   * Working directory for the project
   * @default process.cwd()
   */
  cwd?: string
  /**
   * Writable stream where the test run's main output is written
   * @default process.stderr
   */
  stdout?: Writable
  /**
   * Writable stream where the test run's warning/error output is written
   * @default process.stderr
   */
  stderr?: Writable
  /**
   * Environment variables
   * @default process.env
   */
  env?: NodeJS.ProcessEnv
  /**
   * Whether debug logging should be emitted to {@link stderr}
   * @default false
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/debugging.md}
   */
  debug?: boolean
}

/**
 * Result of a Cucumber test run
 *
 * @public
 */
export interface IRunResult {
  /**
   * Whether the test run was overall successful i.e. no failed scenarios. The exact meaning can vary based on the `strict` configuration option.
   */
  success: boolean
  /**
   * The support code library that was used in the test run; can be reused in subsequent `runCucumber` calls
   */
  support: ISupportCodeLibrary
}
