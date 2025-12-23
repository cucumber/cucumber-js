import { UsableEnvironment } from '../environment'
import {
  CoordinatorEventHandler,
  Plugin,
  PluginCleanup,
  CoordinatorTransformKey,
  PluginOperation,
  FormatterPlugin,
  CoordinatorEventKey,
  CoordinatorTransformer,
  CoordinatorEventValues,
  CoordinatorTransformValues,
} from './types'

type HandlerRegistry = {
  [K in CoordinatorEventKey]: Array<CoordinatorEventHandler<K>>
}

type TransformerRegistry = {
  [K in CoordinatorTransformKey]: Array<CoordinatorTransformer<K>>
}

export class PluginManager {
  private handlers: HandlerRegistry = {
    message: [],
    'paths:resolve': [],
  }
  private transformers: TransformerRegistry = {
    'pickles:filter': [],
    'pickles:order': [],
  }
  private cleanupFns: PluginCleanup[] = []

  constructor(private readonly environment: UsableEnvironment) {}

  private async registerHandler<K extends CoordinatorEventKey>(
    event: K,
    handler: CoordinatorEventHandler<K>
  ) {
    this.handlers[event]?.push(handler)
  }

  private async registerTransformer<K extends CoordinatorTransformKey>(
    event: K,
    handler: CoordinatorTransformer<K>
  ) {
    this.transformers[event]?.push(handler)
  }

  async initFormatter<OptionsType>(
    plugin: FormatterPlugin<OptionsType>,
    options: OptionsType,
    stream: NodeJS.WritableStream,
    write: (buffer: string | Uint8Array) => void,
    directory?: string
  ) {
    const cleanupFn = await plugin.formatter({
      on: (key, handler) => this.registerHandler(key, handler),
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
    operation: PluginOperation,
    plugin: Plugin<OptionsType>,
    options: OptionsType,
    specifier?: string
  ) {
    try {
      const cleanupFn = await plugin.coordinator({
        operation,
        on: this.registerHandler.bind(this),
        transform: this.registerTransformer.bind(this),
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
    } catch (error) {
      if (specifier) {
        throw new Error(`Plugin "${specifier}" errored when trying to init`, {
          cause: error,
        })
      } else {
        throw error
      }
    }
  }

  emit<K extends CoordinatorEventKey>(
    event: K,
    value: CoordinatorEventValues[K]
  ): void {
    this.handlers[event].forEach((handler) => handler(value))
  }

  async transform<K extends CoordinatorTransformKey>(
    event: K,
    value: CoordinatorTransformValues[K]
  ): Promise<CoordinatorTransformValues[K]> {
    let transformed = value
    for (const handler of this.transformers[event]) {
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
