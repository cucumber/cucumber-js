import { Writable } from 'node:stream'
import { Envelope } from '@cucumber/messages'
import { ILogger } from '../environment'
import { IFilterablePickle } from '../filter'
import { IResolvedPaths } from '../paths'

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
export type CoordinatorEventKey = 'message' | 'paths:resolve'

/**
 * Keys for transforms that plugins can register
 * @public
 */
export type CoordinatorTransformKey = 'pickles:filter' | 'pickles:order'

/**
 * Mapping of event keys to their value types
 * @public
 */
export type CoordinatorEventValues = {
  message: Readonly<Envelope>
  'paths:resolve': Readonly<IResolvedPaths>
}

/**
 * Mapping of transform keys to their value types
 * @public
 */
export type CoordinatorTransformValues = {
  'pickles:filter': Readonly<Array<IFilterablePickle>>
  'pickles:order': Readonly<Array<IFilterablePickle>>
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
 * Don't try to modify the original value. Return a transformed value, or
 * `undefined` to pass through unchanged.
 * @public
 */
export type CoordinatorTransformer<K extends CoordinatorTransformKey> = (
  value: CoordinatorTransformValues[K]
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
   */
  options: OptionsType
  /**
   * Logger for emitting user-facing messages or diagnostics
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
export type Plugin<OptionsType = any> = {
  type: 'plugin'
  /**
   * Coordinator function called during initialization
   * @remarks
   * Can do async work, and the Promise will be awaited. Can optionally return
   * a cleanup function to be called when Cucumber is about to exit.
   */
  coordinator: (
    context: CoordinatorContext<OptionsType>
  ) => PromiseLike<PluginCleanup | void> | PluginCleanup | void
  /**
   * Optional key to extract plugin-specific options from the root options object
   */
  optionsKey?: string
}

export type FormatterPluginContext<OptionsType> = {
  on: (key: 'message', handler: (value: Envelope) => void) => void
  options: OptionsType
  logger: ILogger
  stream: NodeJS.WritableStream
  write: (buffer: string | Uint8Array) => void
  directory?: string
}

export type FormatterPluginFunction<OptionsType> = (
  context: FormatterPluginContext<OptionsType>
) => PromiseLike<PluginCleanup | void> | PluginCleanup | void

export type FormatterPlugin<OptionsType = any> = {
  type: 'formatter'
  formatter: FormatterPluginFunction<OptionsType>
  optionsKey?: string
}
