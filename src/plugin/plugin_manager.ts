import { IRunEnvironment } from '../api'
import { ILogger } from '../logger'
import {
  CoordinatorPluginEventHandler,
  Plugin,
  PluginCleanup,
  CoordinatorPluginEventValues,
  CoordinatorEventKey,
  CoordinatorTransformEventKey,
  Operation,
} from './types'

type HandlerRegistry = {
  [K in CoordinatorEventKey]: Array<CoordinatorPluginEventHandler<K>>
}

export class PluginManager {
  private handlers: HandlerRegistry = {
    message: [],
    'paths:resolve': [],
    'pickles:filter': [],
    'pickles:order': [],
  }
  private cleanupFns: PluginCleanup[] = []

  private async register<K extends CoordinatorEventKey>(
    event: K,
    handler: CoordinatorPluginEventHandler<K>
  ) {
    this.handlers[event].push(handler)
  }

  async init<OptionsType>(
    operation: Operation,
    plugin: Plugin<OptionsType>,
    options: OptionsType,
    logger: ILogger,
    environment: Required<IRunEnvironment>
  ) {
    const cleanupFn = await plugin.coordinator({
      operation,
      on: this.register.bind(this),
      options,
      logger,
      environment,
    })
    if (typeof cleanupFn === 'function') {
      this.cleanupFns.push(cleanupFn)
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
