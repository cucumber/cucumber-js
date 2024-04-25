import { Writable } from 'node:stream'
import { JsonObject } from 'type-fest'
import { IPublishConfig } from '../publish'
import { IConfiguration } from '../configuration'
import { IPickleOrder } from '../filter'

/**
 * Options for {@link loadConfiguration}
 * @public
 */
export interface ILoadConfigurationOptions {
  /**
   * Path to load configuration file from, or `false` to skip
   * @default `cucumber.(json|yaml|yml|js|cjs|mjs)`
   */
  file?: string | false
  /**
   * Zero or more profile names from which to source configuration in the file
   * @remarks
   * If omitted or empty, the `default` profile will be used.
   */
  profiles?: string[]
  /**
   * Ad-hoc configuration options to be merged over the top of whatever is
   * loaded from the configuration file/profiles
   * @example
   * \{
   *   failFast: true,
   *   parallel: 2
   * \}
   * @example ["--fail-fast", "--parallel", "2"]
   * @example "--fail-fast --parallel 2"
   * @remarks
   * This can also be provided as an array or single string of argv-style
   * arguments.
   */
  provided?: Partial<IConfiguration> | string[] | string
}

/**
 * Response from {@link loadConfiguration}
 * @public
 */
export interface IResolvedConfiguration {
  /**
   * The final flat configuration object resolved from the configuration
   * file/profiles plus any extra provided
   */
  useConfiguration: IConfiguration
  /**
   * The format that can be passed into {@link runCucumber}
   */
  runConfiguration: IRunConfiguration
}

/**
 * Options relating to sources (i.e. feature files) - where to load them from,
 * how to interpret, filter and order them
 * @public
 */
export interface ISourcesCoordinates {
  /**
   * Default Gherkin dialect
   * @remarks
   * Used if no dialect is specified in the feature file itself.
   */
  defaultDialect: string
  /**
   * Paths and/or glob expressions to feature files
   */
  paths: string[]
  /**
   * Regular expressions of which scenario names should match one of to be run
   */
  names: string[]
  /**
   * Tag expression to filter which scenarios should be run
   */
  tagExpression: string
  /**
   * Run in the order defined, or in a random order
   */
  order: IPickleOrder
}

/**
 * A pickle that has been successfully compiled from a source
 * @public
 */
export interface IPlannedPickle {
  /**
   * Name of the pickle (after parameter resolution)
   */
  name: string
  uri: string
  location: {
    line: number
    column?: number
  }
}

/**
 * An error encountered when parsing a source
 * @public
 */
export interface ISourcesError {
  uri: string
  location: {
    line: number
    column?: number
  }
  /**
   * Error message explaining what went wrong with the parse
   */
  message: string
}

/**
 * Response from {@link loadSources}
 * @public
 */
export interface ILoadSourcesResult {
  /**
   * Pickles that have been successfully compiled, in the order they would be
   * run in
   */
  plan: IPlannedPickle[]
  /**
   * Any errors encountered when parsing sources
   */
  errors: ISourcesError[]
}

/**
 * Options relating to user code (aka support code) - where to load it from and
 * how to preprocess it
 * @public
 */
export interface ISupportCodeCoordinates {
  /**
   * Names of transpilation modules to load, via `require()`
   */
  requireModules: string[]
  /**
   * Paths and/or glob expressions of user code to load, via `require()`
   */
  requirePaths: string[]
  /**
   * Paths and/or glob expressions of user code to load, via `import()`
   */
  importPaths: string[]
  /**
   * Specifiers of loaders to register, via `register()`
   */
  loaders: string[]
}

/**
 * Options for {@link loadSupport}
 * @public
 * @remarks
 * A subset of {@link IRunConfiguration}
 */
export interface ILoadSupportOptions {
  /**
   * @remarks
   * This is needed because the default support path locations are derived from
   * feature file locations.
   */
  sources: ISourcesCoordinates
  support: Partial<ISupportCodeCoordinates>
}

/**
 * Options relating to behaviour when actually running tests
 * @public
 */
export interface IRunOptionsRuntime {
  /**
   * Perform a dry run, where a test run is prepared but nothing is executed
   */
  dryRun: boolean
  /**
   * Stop running tests when a test fails
   */
  failFast: boolean
  /**
   * Filter out stack frames from Cucumber's code when formatting stack traces
   */
  filterStacktraces: boolean
  /**
   * Run tests in parallel with the given number of worker processes
   */
  parallel: number
  /**
   * Retry failing tests up to the given number of times
   */
  retry: number
  /**
   * Tag expression to filter which scenarios can be retried
   */
  retryTagFilter: string
  /**
   * Fail the test run if there are pending steps
   */
  strict: boolean
  /**
   * Parameters to be passed to the World
   * @remarks
   * The value must be a JSON-serializable object.
   */
  worldParameters: JsonObject
}

/**
 * Options relating to formatters - which ones to use, where to write their
 * output, how they should behave
 * @public
 */
export interface IRunOptionsFormats {
  /**
   * Name/path of the formatter to use for `stdout` output
   */
  stdout: string
  /**
   * Zero or more mappings of file output path (key) to name/path of the
   * formatter to use (value)
   * @example
   * \{
   *   "./reports/cucumber.html": "html",
   *   "./reports/custom.txt": "./custom-formatter.js"
   * \}
   */
  files: Record<string, string>
  /**
   * Options for report publication, or `false` to disable publication
   */
  publish: IPublishConfig | false
  /**
   * Options to be provided to formatters
   * @remarks
   * The value must be a JSON-serializable object.
   */
  options: JsonObject
}

/**
 * Structured configuration object suitable for passing to {@link runCucumber}
 * @public
 */
export interface IRunConfiguration {
  sources: ISourcesCoordinates
  support: Partial<ISupportCodeCoordinates>
  runtime: IRunOptionsRuntime
  formats: IRunOptionsFormats
}

/**
 * A collection of user-defined code and setup ("support code") that can be
 * used for a test run
 * @public
 * @remarks
 * This is mostly a marker interface. The actual instance is a complex object
 * that you shouldn't interact with directly, but some functions return and/or
 * accept it as a means of optimising a test workflow.
 */
export interface ISupportCodeLibrary {
  readonly originalCoordinates: ISupportCodeCoordinates
}

/**
 * Either an actual {@link ISupportCodeLibrary | support code library}, or the
 * {@link ISupportCodeCoordinates | coordinates} required to create and
 * populate one
 * @public
 * @remarks
 * This alias exists because {@link runCucumber} will accept an existing
 * support code library in its options and thus avoid trying to load it again,
 * improving performance and avoiding cache issues for use cases where multiple
 * test runs happen within the same process. Note this is only useful in serial
 * mode, as parallel workers will each load the support code themselves anyway.
 */
export type ISupportCodeCoordinatesOrLibrary =
  | Partial<ISupportCodeCoordinates>
  | ISupportCodeLibrary

/**
 * Options for {@link runCucumber}
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
 * @public
 */
export interface IRunEnvironment {
  /**
   * Working directory for the project
   * @default process.cwd()
   */
  cwd?: string
  /**
   * Writable stream where the test run's main formatter output is written
   * @default process.stdout
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
   * Whether debug logging should be emitted to {@link IRunEnvironment.stderr}
   * @default false
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/debugging.md}
   */
  debug?: boolean
}

/**
 * Response from {@link runCucumber}
 * @public
 */
export interface IRunResult {
  /**
   * Whether the test run was overall successful
   * @remarks
   * The exact meaning can vary based on the `strict` configuration option.
   */
  success: boolean
  /**
   * The support code library that was used in the test run
   * @remarks
   * This can be reused in subsequent {@link runCucumber} calls,
   * see {@link ISupportCodeCoordinatesOrLibrary}
   */
  support: ISupportCodeLibrary
}
