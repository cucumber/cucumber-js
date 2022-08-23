import { Plugin, PluginCleanup, PluginEvents } from './types'
import { IRunEnvironment, IRunOptions } from '../api'
import { ILogger } from '../logger'

type HandlerRegistry = {
  [K in keyof PluginEvents]: Array<(value: PluginEvents[K]) => void>
}

export class PluginManager {
  private handlers: HandlerRegistry = { message: [] }
  private cleanupFns: PluginCleanup[] = []

  constructor(private pluginFns: Plugin[]) {}

  private async register<K extends keyof PluginEvents>(
    event: K,
    handler: (value: PluginEvents[K]) => void
  ) {
    this.handlers[event].push(handler)
  }

  async init(
    logger: ILogger,
    configuration: IRunOptions,
    environment: IRunEnvironment
  ) {
    for (const pluginFn of this.pluginFns) {
      const cleanupFn = await pluginFn({
        on: this.register.bind(this),
        logger,
        configuration,
        environment,
      })
      if (cleanupFn) {
        this.cleanupFns.push(cleanupFn)
      }
    }
  }

  emit<K extends keyof PluginEvents>(event: K, value: PluginEvents[K]): void {
    this.handlers[event].forEach((handler) => handler(value))
  }

  async cleanup(): Promise<void> {
    for (const cleanupFn of this.cleanupFns) {
      await cleanupFn()
    }
  }
}
