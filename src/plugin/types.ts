import { Envelope, Pickle } from '@cucumber/messages'
import { ArrayValues, Promisable } from 'type-fest'
import { IRunConfiguration, IRunEnvironment } from '../api'
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

export interface CoordinatorPluginContext {
  on: <K extends CoordinatorEventKey>(
    event: K,
    handler: CoordinatorPluginEventHandler<K>
  ) => void
  logger: ILogger
  configuration: IRunConfiguration
  environment: IRunEnvironment
}

export type CoordinatorPluginFunction = (
  context: CoordinatorPluginContext
) => Promisable<PluginCleanup | void>

export type PluginCleanup = () => Promisable<void>

export interface Plugin {
  type: 'plugin'
  coordinator: CoordinatorPluginFunction
}
