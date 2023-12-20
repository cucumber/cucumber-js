import { Envelope } from '@cucumber/messages'
import { ArrayValues, Jsonifiable, Promisable, ReadonlyDeep } from 'type-fest'
import { IRunEnvironment } from '../api'
import { ILogger } from '../logger'
import { IFilterablePickle } from '../filter'
import { IResolvedPaths } from '../paths'
import { coordinatorTransformKeys, coordinatorVoidKeys } from './events'

export type Operation = 'loadSources' | 'loadSupport' | 'runCucumber'

export type CoordinatorVoidEventKey = ArrayValues<typeof coordinatorVoidKeys>
export type CoordinatorTransformEventKey = ArrayValues<
  typeof coordinatorTransformKeys
>
export type CoordinatorEventKey =
  | CoordinatorVoidEventKey
  | CoordinatorTransformEventKey

export type CoordinatorPluginEventValues = {
  // void
  message: Readonly<Envelope>
  'paths:resolve': Readonly<IResolvedPaths>
  // transform
  'pickles:filter': Readonly<Array<IFilterablePickle>>
  'pickles:order': Readonly<Array<IFilterablePickle>>
}

export type CoordinatorPluginEventHandler<K extends CoordinatorEventKey> = (
  value: CoordinatorPluginEventValues[K]
) => K extends CoordinatorTransformEventKey
  ? Promisable<CoordinatorPluginEventValues[K]>
  : void

export interface CoordinatorPluginContext<OptionsType> {
  operation: Operation
  on: <EventKey extends CoordinatorEventKey>(
    event: EventKey,
    handler: CoordinatorPluginEventHandler<EventKey>
  ) => void
  options: OptionsType
  logger: ILogger
  environment: Required<IRunEnvironment>
}

export type CoordinatorPluginFunction<OptionsType> = (
  context: CoordinatorPluginContext<OptionsType>
) => Promisable<PluginCleanup | void>

export type PluginCleanup = () => Promisable<void>

export interface Plugin<OptionsType = ReadonlyDeep<Jsonifiable>> {
  type: 'plugin'
  coordinator: CoordinatorPluginFunction<OptionsType>
}
