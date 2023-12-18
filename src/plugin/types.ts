import { Envelope, Pickle } from '@cucumber/messages'
import { ArrayValues, Jsonifiable, Promisable, ReadonlyDeep } from 'type-fest'
import { IRunEnvironment } from '../api'
import { ILogger } from '../logger'
import { coordinatorTransformKeys, coordinatorVoidKeys } from './events'

export type CoordinatorVoidEventKey = ArrayValues<typeof coordinatorVoidKeys>
export type CoordinatorTransformEventKey = ArrayValues<
  typeof coordinatorTransformKeys
>
export type CoordinatorEventKey =
  | CoordinatorVoidEventKey
  | CoordinatorTransformEventKey

export type CoordinatorPluginEventValues = {
  message: Envelope
  'pickles:filter': Readonly<Array<Pickle>>
}

export type CoordinatorPluginEventHandler<K extends CoordinatorEventKey> = (
  value: CoordinatorPluginEventValues[K]
) => K extends CoordinatorTransformEventKey
  ? Promisable<CoordinatorPluginEventValues[K]>
  : void

export interface CoordinatorPluginContext<OptionsType> {
  on: <EventKey extends CoordinatorEventKey>(
    event: EventKey,
    handler: CoordinatorPluginEventHandler<EventKey>
  ) => void
  options: OptionsType
  logger: ILogger
  environment: IRunEnvironment
}

export type CoordinatorPluginFunction<OptionsType> = (
  context: CoordinatorPluginContext<OptionsType>
) => Promisable<PluginCleanup | void>

export type PluginCleanup = () => Promisable<void>

export interface Plugin<OptionsType = ReadonlyDeep<Jsonifiable>> {
  type: 'plugin'
  coordinator: CoordinatorPluginFunction<OptionsType>
}
