import { IRunEnvironment, IRunOptions } from '../api'
import { Envelope } from '@cucumber/messages'

export type PluginCleanup = () => any | void | Promise<any | void>

interface PluginContext {
  on: (event: 'message', handler: (value: Envelope) => void) => void
  logger: Console
  configuration: IRunOptions
  environment: IRunEnvironment
}

export type Plugin = (context: PluginContext) => Promise<PluginCleanup | void>
