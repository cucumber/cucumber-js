import { UsableEnvironment } from '../environment'
import {
  CoordinatorPluginEventHandler,
  BehaviourPlugin,
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

  constructor(private readonly environment: UsableEnvironment) {}

  private async register<K extends CoordinatorPluginEventKey>(
    event: K,
    handler: CoordinatorPluginEventHandler<K>
  ) {
    this.handlers[event]?.push(handler)
  }

  async initFormatter<OptionsType>(
    plugin: FormatterPlugin<OptionsType>,
    options: OptionsType,
    stream: NodeJS.WritableStream,
    write: (buffer: string | Uint8Array) => void,
    directory?: string
  ) {
    const cleanupFn = await plugin.formatter({
      on: (key, handler) => this.register(key, handler),
      options: plugin.optionsKey
        ? ((options as any)[plugin.optionsKey] ?? ({} as OptionsType))
        : options,
      logger: this.environment.logger,
      stream,
      write,
      directory,
    })
    if (typeof cleanupFn === 'function') {
      this.cleanupFns.push(cleanupFn)
    }
  }

  async initCoordinator<OptionsType>(
    operation: Operation,
    plugin: BehaviourPlugin<OptionsType>,
    options: OptionsType
  ) {
    const cleanupFn = await plugin.coordinator({
      operation,
      on: this.register.bind(this),
      options:
        'optionsKey' in plugin && plugin.optionsKey
          ? ((options as any)[plugin.optionsKey] ?? ({} as OptionsType))
          : options,
      logger: this.environment.logger,
      environment: {
        cwd: this.environment.cwd,
        stderr: this.environment.stderr,
        env: { ...this.environment.env },
      },
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
