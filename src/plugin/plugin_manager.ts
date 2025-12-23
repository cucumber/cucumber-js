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

type SourcedEventHandler<K extends CoordinatorEventKey> = {
  handler: CoordinatorEventHandler<K>
  specifier?: string
}

type SourcedTransformer<K extends CoordinatorTransformKey> = {
  transformer: CoordinatorTransformer<K>
  specifier?: string
}

type SourcedCleanup = {
  cleanup: PluginCleanup
  specifier?: string
}

type HandlerRegistry = {
  [K in CoordinatorEventKey]: Array<SourcedEventHandler<K>>
}

type TransformerRegistry = {
  [K in CoordinatorTransformKey]: Array<SourcedTransformer<K>>
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
  private cleanupFns: SourcedCleanup[] = []

  constructor(private readonly environment: UsableEnvironment) {}

  private async registerHandler<K extends CoordinatorEventKey>(
    event: K,
    handler: CoordinatorEventHandler<K>,
    specifier?: string
  ) {
    if (!this.handlers[event]) {
      throw new Error(`Cannot register handler for unknown event "${event}"`)
    }
    this.handlers[event].push({
      handler,
      specifier,
    })
  }

  private async registerTransformer<K extends CoordinatorTransformKey>(
    event: K,
    transformer: CoordinatorTransformer<K>,
    specifier?: string
  ) {
    if (!this.transformers[event]) {
      throw new Error(
        `Cannot register transformer for unknown event "${event}"`
      )
    }
    this.transformers[event].push({
      transformer,
      specifier,
    })
  }

  async initFormatter<OptionsType>(
    plugin: FormatterPlugin<OptionsType>,
    options: OptionsType,
    stream: NodeJS.WritableStream,
    write: (buffer: string | Uint8Array) => void,
    directory?: string,
    specifier?: string
  ) {
    const cleanupFn = await plugin.formatter({
      on: (key, handler) => this.registerHandler(key, handler, specifier),
      options: plugin.optionsKey
        ? ((options as any)[plugin.optionsKey] ?? ({} as OptionsType))
        : options,
      logger: this.environment.logger,
      stream,
      write,
      directory,
    })
    if (typeof cleanupFn === 'function') {
      this.cleanupFns.push({
        cleanup: cleanupFn,
        specifier,
      })
    }
  }

  async initCoordinator<OptionsType>(
    operation: PluginOperation,
    plugin: Plugin<OptionsType>,
    options: OptionsType,
    specifier?: string
  ) {
    const context = {
      operation,
      on: <K extends CoordinatorEventKey>(
        event: K,
        handler: CoordinatorEventHandler<K>
      ) => this.registerHandler(event, handler, specifier),
      transform: <K extends CoordinatorTransformKey>(
        event: K,
        transformer: CoordinatorTransformer<K>
      ) => this.registerTransformer(event, transformer, specifier),
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
    }
    try {
      const cleanupFn = await plugin.coordinator(context)
      if (typeof cleanupFn === 'function') {
        this.cleanupFns.push({
          cleanup: cleanupFn,
          specifier,
        })
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
    this.handlers[event].forEach(({ handler, specifier }) => {
      try {
        handler(value)
      } catch (error) {
        if (specifier) {
          throw new Error(
            `Plugin "${specifier}" errored when trying to handle a "${event}" event`,
            {
              cause: error,
            }
          )
        } else {
          throw error
        }
      }
    })
  }

  async transform<K extends CoordinatorTransformKey>(
    event: K,
    value: CoordinatorTransformValues[K]
  ): Promise<CoordinatorTransformValues[K]> {
    let transformed = value
    for (const { transformer, specifier } of this.transformers[event]) {
      try {
        const returned = await transformer(transformed)
        if (typeof returned !== 'undefined') {
          transformed = returned
        }
      } catch (error) {
        if (specifier) {
          throw new Error(
            `Plugin "${specifier}" errored when trying to do a "${event}" transform`,
            {
              cause: error,
            }
          )
        } else {
          throw error
        }
      }
    }
    return transformed
  }

  async cleanup(): Promise<void> {
    for (const { cleanup, specifier } of this.cleanupFns) {
      try {
        await cleanup()
      } catch (error) {
        if (specifier) {
          throw new Error(
            `Plugin "${specifier}" errored when trying to cleanup`,
            {
              cause: error,
            }
          )
        } else {
          throw error
        }
      }
    }
  }
}
