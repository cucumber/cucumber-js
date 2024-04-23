import { JsonObject } from 'type-fest'
import { IPickleOrder } from '../filter'

/**
 * User-defined configuration
 *
 * @public
 */
export interface IConfiguration {
  /**
   * Paths to where your feature files are
   * @default []
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features}
   */
  paths: string[]
  /**
   * Show the full backtrace for errors
   * @default false
   */
  backtrace: boolean
  /**
   * Perform a dry run, where a test run is prepared but nothing is executed
   * @default false
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/dry_run.md}
   */
  dryRun: boolean
  /**
   * Explicitly call `process.exit()` after the test run
   * @default false
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#exiting}
   * @remarks
   * This option is only used by the CLI.
   */
  forceExit: boolean
  /**
   * Stop running tests when a test fails
   * @default false
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/fail_fast.md}
   */
  failFast: boolean
  /**
   * Name/path and (optionally) output file path of each formatter to use
   *
   * @example
   * [
   *   "\@cucumber/pretty-formatter",
   *   ["html", "./reports/cucumber.html"],
   *   ["./custom-formatter.js", "./reports/custom.txt"]
   * ]
   * @default []
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md}
   * @remarks
   * Each item has one or two values. The first (required) identifies the
   * formatter to be used. The second (optional) specifies where the output
   * should be written.
   */
  format: Array<string | [string, string?]>
  /**
   * Options to be provided to formatters
   * @default \{\}
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md#options}
   * @remarks
   * The value must be a JSON-serializable object.
   */
  formatOptions: JsonObject
  /**
   * Paths to where your support code is
   * @default []
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code}
   */
  import: string[]
  /**
   * Default language for your feature files
   * @default "en"
   */
  language: string
  /**
   * Module specifier(s) for loaders to be registered ahead of loading support code
   * @default []
   */
  loader: string[]
  /**
   * Regular expressions of which scenario names should match one of to be run
   * @default []
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/filtering.md#names}
   */
  name: string[]
  /**
   * Run in the order defined, or in a random order
   * @default "defined"
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/filtering.md#order}
   */
  order: IPickleOrder
  /**
   * Run tests in parallel with the given number of worker processes
   * @default 0
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/parallel.md}
   */
  parallel: number
  /**
   * Publish a report of your test run to https://reports.cucumber.io/
   * @default false
   */
  publish: boolean
  /**
   * @deprecated no longer needed
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md}
   */
  publishQuiet: boolean
  /**
   * Paths to where your support code is, for CommonJS
   * @default []
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code}
   */
  require: string[]
  /**
   * Names of transpilation modules to load, via `require()`
   * @default []
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/transpiling.md}
   */
  requireModule: string[]
  /**
   * Retry failing tests up to the given number of times
   * @default 0
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/retry.md}
   */
  retry: number
  /**
   * Tag expression to filter which scenarios can be retried
   * @default ""
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/retry.md}
   */
  retryTagFilter: string
  /**
   * Fail the test run if there are pending steps
   * @default true
   */
  strict: boolean
  /**
   * Tag expression to filter which scenarios should be run
   * @default ""
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/filtering.md#tags}
   */
  tags: string
  /**
   * Parameters to be passed to your World
   * @default \{\}
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md}
   * @remarks
   * The value must be a JSON-serializable object.
   */
  worldParameters: JsonObject
}
