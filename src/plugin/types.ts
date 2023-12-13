import { Envelope } from '@cucumber/messages'
import { IRunConfiguration, IRunEnvironment } from '../api'
import { ILogger } from '../logger'

export interface PluginEvents {
  message: Envelope
}

export interface PluginContext {
  on: <K extends keyof PluginEvents>(
    event: K,
    handler: (value: PluginEvents[K]) => void
  ) => void
  logger: ILogger
  configuration: IRunConfiguration
  environment: IRunEnvironment
}

export type PluginCleanup = () => any | void | Promise<any | void>

export type CoordinatorPluginFunction = (
  context: PluginContext
) => Promise<PluginCleanup | void>

export interface Plugin {
  type: 'plugin'
  coordinator: CoordinatorPluginFunction
}
