import { Writable } from 'node:stream'

/**
 * A logger that can be used to direct messages to stderr or similar
 * @public
 * @remarks
 * Matches the interface of Node.js Console, for the methods it has.
 */
export interface ILogger {
  debug: (message?: any, ...optionalParams: any[]) => void
  error: (message?: any, ...optionalParams: any[]) => void
  warn: (message?: any, ...optionalParams: any[]) => void
  info: (message?: any, ...optionalParams: any[]) => void
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
  env?: Record<string, string | undefined>
  /**
   * Whether debug logging should be emitted to {@link IRunEnvironment.stderr}
   * @default false
   * @see {@link https://github.com/cucumber/cucumber-js/blob/main/docs/debugging.md}
   */
  debug?: boolean
}

export type UsableEnvironment = Required<IRunEnvironment> & {
  logger: ILogger
}
