import { IRunConfiguration, IRunEnvironment } from '../api'
import { ILogger } from '../logger'
import {
  CoordinatorPluginEventHandler,
  Plugin,
  PluginCleanup,
  CoordinatorPluginEventValues,
  CoordinatorEventKey,
  CoordinatorTransformEventKey,
} from './types'

type HandlerRegistry = {
  [K in CoordinatorEventKey]: Array<CoordinatorPluginEventHandler<K>>
}

export class PluginManager {
  private handlers: HandlerRegistry = { message: [], 'pickles:filter': [] }
  private cleanupFns: PluginCleanup[] = []

  constructor(private plugins: Plugin[]) {}

  private async register<K extends CoordinatorEventKey>(
    event: K,
    handler: CoordinatorPluginEventHandler<K>
  ) {
    this.handlers[event].push(handler)
  }

  async init(
    logger: ILogger,
    configuration: IRunConfiguration,
    environment: IRunEnvironment
  ) {
    for (const plugin of this.plugins) {
      const cleanupFn = await plugin.coordinator({
        on: this.register.bind(this),
        logger,
        configuration,
        environment,
      })
      if (typeof cleanupFn === 'function') {
        this.cleanupFns.push(cleanupFn)
      }
    }
  }

  emit<K extends CoordinatorEventKey>(
    event: K,
    value: CoordinatorPluginEventValues[K]
  ): void {
    this.handlers[event].forEach((handler) => handler(value))
  }

  async transform<K extends CoordinatorTransformEventKey>(
    event: K,
    value: CoordinatorPluginEventValues[K]
  ): Promise<CoordinatorPluginEventValues[K]> {
    let transformed = value
    for (const handler of this.handlers[event]) {
      transformed = await handler(transformed)
    }
    return transformed
  }

  async cleanup(): Promise<void> {
    for (const cleanupFn of this.cleanupFns) {
      await cleanupFn()
    }
  }
}
