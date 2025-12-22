import { Writable } from 'node:stream'
import { Envelope } from '@cucumber/messages'
import { ILogger } from '../environment'
import { IFilterablePickle } from '../filter'
import { IResolvedPaths } from '../paths'

export type PluginOperation = 'loadSources' | 'loadSupport' | 'runCucumber'

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

export type CoordinatorEventKey = 'message' | 'paths:resolve'
export type CoordinatorTransformKey = 'pickles:filter' | 'pickles:order'

export type CoordinatorEventValues = {
  message: Readonly<Envelope>
  'paths:resolve': Readonly<IResolvedPaths>
}

export type CoordinatorTransformValues = {
  'pickles:filter': Readonly<Array<IFilterablePickle>>
  'pickles:order': Readonly<Array<IFilterablePickle>>
}

export type CoordinatorEventHandler<K extends CoordinatorEventKey> = (
  value: CoordinatorEventValues[K]
) => void

export type CoordinatorTransformer<K extends CoordinatorTransformKey> = (
  value: CoordinatorTransformValues[K]
) => PromiseLike<CoordinatorTransformValues[K]> | CoordinatorTransformValues[K]

export type CoordinatorContext<OptionsType> = {
  operation: PluginOperation
  on: <EventKey extends CoordinatorEventKey>(
    event: EventKey,
    handler: CoordinatorEventHandler<EventKey>
  ) => void
  transform: <EventKey extends CoordinatorTransformKey>(
    event: EventKey,
    handler: CoordinatorTransformer<EventKey>
  ) => void
  options: OptionsType
  logger: ILogger
  environment: CoordinatorEnvironment
}

export type PluginCleanup = () => PromiseLike<void> | void

export type Plugin<OptionsType = any> = {
  type: 'plugin'
  coordinator: (
    context: CoordinatorContext<OptionsType>
  ) => PromiseLike<PluginCleanup | void> | PluginCleanup | void
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
