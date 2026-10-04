import type { Writable } from 'node:stream'
import type {
  Envelope,
  GherkinDocument,
  Pickle,
  TestCase,
  TestCaseStarted,
  TestStepResult,
} from '@cucumber/messages'
import type { ILogger } from '../environment'
import type { IFilterablePickle } from '../filter'
import type { IResolvedPaths } from '../paths'

/**
 * The operation Cucumber is doing in this process
 * @public
 * @remarks
 * `loadSources` and `loadSupport` are generally used as preflight operations
 * for complex use cases. `runCucumber` is the one where tests are actually
 * executed.
 */
export type PluginOperation = 'loadSources' | 'loadSupport' | 'runCucumber'

/**
 * Subset of the environment available to plugins
 * @public
 */
export type CoordinatorEnvironment = {
  /**
   * Working directory for the project
   */
  cwd: string
  /**
   * Writable stream where the test run's warning/error output is written
   * and plugins can write to directly if required
   */
  stderr: Writable
  /**
   * Environment variables
   */
  env: Record<string, string | undefined>
}

/**
 * Keys for event handlers that plugins can register
 * @public
 */
export type CoordinatorEventKey = 'message' | 'paths:resolve' | 'publish:url'

/**
 * Keys for transforms that plugins can register
 * @public
 */
export type CoordinatorTransformKey = 'pickles:filter' | 'pickles:order' | 'testCase:retry'

/**
 * Mapping of event keys to their value types
 * @public
 */
export type CoordinatorEventValues = {
  message: Readonly<Envelope>
  'paths:resolve': Readonly<IResolvedPaths>
  'publish:url': string
}

/**
 * Mapping of transform keys to their value types
 * @public
 */
export type CoordinatorTransformValues = {
  'pickles:filter': Readonly<Array<IFilterablePickle>>
  'pickles:order': Readonly<Array<IFilterablePickle>>
  'testCase:retry': boolean
}

/**
 * A failed test case attempt that is being considered for retry
 * @public
 */
export interface RetryCandidate {
  /**
   * The Gherkin document the test case came from
   */
  gherkinDocument: GherkinDocument
  /**
   * The pickle the test case was assembled from
   */
  pickle: Pickle
  /**
   * The test case being attempted
   */
  testCase: TestCase
  /**
   * The message for the attempt that just finished, including its zero-based `attempt` number
   */
  testCaseStarted: TestCaseStarted
  /**
   * The worst step result of the attempt; always has a FAILED status
   */
  result: TestStepResult
}

/**
 * Mapping of transform keys to the context passed as the second argument to transformers
 * @public
 */
export type CoordinatorTransformContexts = {
  'pickles:filter': undefined
  'pickles:order': undefined
  'testCase:retry': Readonly<RetryCandidate>
}

/**
 * Handler function for a coordinator event
 * @public
 * @remarks
 * You can do async work here, but Cucumber will not await the Promise.
 */
export type CoordinatorEventHandler<K extends CoordinatorEventKey> = (
  value: CoordinatorEventValues[K]
) => void

/**
 * Transformer function for a coordinator transform
 * @remarks
 * Don't try to modify the original value or the context. Return a transformed
 * value, or `undefined` to pass through unchanged.
 * @public
 */
export type CoordinatorTransformer<K extends CoordinatorTransformKey> = (
  value: CoordinatorTransformValues[K],
  context: CoordinatorTransformContexts[K]
) => PromiseLike<CoordinatorTransformValues[K]> | CoordinatorTransformValues[K]

/**
 * Context object passed to a plugin's coordinator function
 * @public
 */
export type CoordinatorContext<OptionsType> = {
  /**
   * The operation Cucumber is doing in this process
   */
  operation: PluginOperation
  /**
   * Register an event handler
   */
  on: <EventKey extends CoordinatorEventKey>(
    event: EventKey,
    handler: CoordinatorEventHandler<EventKey>
  ) => void
  /**
   * Register a transformer
   */
  transform: <EventKey extends CoordinatorTransformKey>(
    event: EventKey,
    handler: CoordinatorTransformer<EventKey>
  ) => void
  /**
   * Options for the plugin
   * @remarks
   * If the plugin definition provides an `optionsKey`, this value will be
   * from that key in the global options object. Otherwise, it will be the
   * entire global options object.
   */
  options: OptionsType
  /**
   * Logger for emitting user-facing messages or diagnostics; goes to `stderr`
   */
  logger: ILogger
  /**
   * Subset of the environment
   */
  environment: CoordinatorEnvironment
}

/**
 * Optional cleanup function returned by a plugin coordinator
 * @public
 */
export type PluginCleanup = () => PromiseLike<void> | void

/**
 * A plugin that can subscribe to events and register transforms
 * @public
 */
// biome-ignore lint/suspicious/noExplicitAny: options are defined by the plugin itself and really can be anything; plugins can supply a type argument to narrow
export type Plugin<OptionsType = any> = {
  type: 'plugin'
  /**
   * Coordinator function called during initialization
   * @remarks
   * Can do async work, and the Promise will be awaited. Can optionally return
   * a cleanup function to be called when the operation has finished.
   */
  coordinator: (
    context: CoordinatorContext<OptionsType>
  ) => PromiseLike<PluginCleanup | void> | PluginCleanup | void
  /**
   * Optional key to extract plugin-specific options from the root options object
   */
  optionsKey?: string
}

/**
 * Context object passed to an internal plugin's coordinator function
 * @internal
 */
export type InternalCoordinatorContext<OptionsType> = CoordinatorContext<OptionsType> & {
  emit: <EventKey extends CoordinatorEventKey>(
    event: EventKey,
    value: CoordinatorEventValues[EventKey]
  ) => void
}

/**
 * A built-in plugin with the additional ability to emit events
 * @internal
 */
// biome-ignore lint/suspicious/noExplicitAny: options are defined by the plugin itself and really can be anything; plugins can supply a type argument to narrow
export type InternalPlugin<OptionsType = any> = {
  type: 'plugin'
  coordinator: (
    context: InternalCoordinatorContext<OptionsType>
  ) => PromiseLike<PluginCleanup | void> | PluginCleanup | void
}

/**
 * Context object passed to a formatter plugin's function
 * @public
 */
export type FormatterPluginContext<OptionsType> = {
  /**
   * Register a handler for Cucumber Messages
   */
  on: (key: 'message', handler: (value: Envelope) => void) => void
  /**
   * Options for the formatter
   * @remarks
   * If the plugin definition provides an `optionsKey`, this value will be
   * from that key in the global options object. Otherwise, it will be the
   * entire global options object.
   */
  options: OptionsType
  /**
   * Logger for emitting user-facing messages or diagnostics; goes to `stderr`
   */
  logger: ILogger
  /**
   * The writable stream the output is being written to
   * @remarks
   * Ideally you should use this only for feature detection and/or advanced
   * TTY functionality; for just writing output, use `write`
   */
  stream: NodeJS.WritableStream
  /**
   * Fire-and-forget function to write data to the output stream
   */
  write: (buffer: string | Uint8Array) => void
  /**
   * The directory containing the target file, if the output stream is for a
   * file
   * @remarks
   * This can be used to write additional files as siblings to the output file,
   * but this should be for exceptional cases; we recommend keeping formatter
   * output self-contained as much as possible.
   */
  directory?: string
}

/**
 * A plugin that consumes Cucumber Messages and writes formatted output to a stream
 * @public
 */
// biome-ignore lint/suspicious/noExplicitAny: options are defined by the plugin itself and really can be anything; plugins can supply a type argument to narrow
export type FormatterPlugin<OptionsType = any> = {
  type: 'formatter'
  /**
   * Coordinator function called during initialization
   * @remarks
   * Can do async work, and the Promise will be awaited. Can optionally return
   * a cleanup function to be called before the stream is finished.
   */
  formatter: (
    context: FormatterPluginContext<OptionsType>
  ) => PromiseLike<PluginCleanup | void> | PluginCleanup | void
  /**
   * Optional key to extract plugin-specific options from the format options object
   */
  optionsKey?: string
}
