import { IRunEnvironment } from '../api'
import { ILogger } from '../logger'
import {
  CoordinatorPluginEventHandler,
  InternalPlugin,
  PluginCleanup,
  CoordinatorPluginEventValues,
  CoordinatorPluginEventKey,
  CoordinatorPluginTransformEventKey,
  Operation,
  FormatterPlugin,
} from './types'

type HandlerRegistry = {
  [K in CoordinatorPluginEventKey]: Array<CoordinatorPluginEventHandler<K>>
}

export class PluginManager {
  private handlers: HandlerRegistry = {
    message: [],
    'paths:resolve': [],
    'pickles:filter': [],
    'pickles:order': [],
  }
  private cleanupFns: PluginCleanup[] = []

  private async register<K extends CoordinatorPluginEventKey>(
    event: K,
    handler: CoordinatorPluginEventHandler<K>
  ) {
    this.handlers[event]?.push(handler)
  }

  async initFormatter<OptionsType>(
    plugin: FormatterPlugin<OptionsType>,
    options: OptionsType,
    write: (buffer: string | Uint8Array) => void
  ) {
    const cleanupFn = await plugin.formatter({
      on: (key, handler) => this.register(key, handler),
      options,
      write,
    })
    if (typeof cleanupFn === 'function') {
      this.cleanupFns.push(cleanupFn)
    }
  }

  async initCoordinator<OptionsType>(
    operation: Operation,
    plugin: InternalPlugin<OptionsType>,
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

  emit<K extends CoordinatorPluginEventKey>(
    event: K,
    value: CoordinatorPluginEventValues[K]
  ): void {
    this.handlers[event].forEach((handler) => handler(value))
  }

  async transform<K extends CoordinatorPluginTransformEventKey>(
    event: K,
    value: CoordinatorPluginEventValues[K]
  ): Promise<CoordinatorPluginEventValues[K]> {
    let transformed = value
    for (const handler of this.handlers[event]) {
      const returned = await handler(transformed)
      if (typeof returned !== 'undefined') {
        transformed = returned
      }
    }
    return transformed
  }

  async cleanup(): Promise<void> {
    for (const cleanupFn of this.cleanupFns) {
      await cleanupFn()
    }
  }
}
