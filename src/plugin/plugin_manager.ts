import { UsableEnvironment } from '../environment'
import {
  CoordinatorContext,
  CoordinatorEventHandler,
  CoordinatorEventKey,
  CoordinatorEventValues,
  CoordinatorTransformer,
  CoordinatorTransformKey,
  CoordinatorTransformValues,
  FormatterPlugin,
  InternalPlugin,
  Plugin,
  PluginCleanup,
  PluginOperation,
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
  cleanupFn: PluginCleanup
  specifier?: string
}

type HandlerRegistry = {
  [K in CoordinatorEventKey]: Array<SourcedEventHandler<K>>
}

type TransformerRegistry = {
  [K in CoordinatorTransformKey]: Array<SourcedTransformer<K>>
}

export class PluginManager {
  private readonly handlers: HandlerRegistry = {
    message: [],
    'paths:resolve': [],
    'publish:url': [],
  }
  private readonly transformers: TransformerRegistry = {
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
        cleanupFn: cleanupFn,
        specifier,
      })
    }
  }

  async initCoordinatorExternal<OptionsType>(
    operation: PluginOperation,
    plugin: Plugin<OptionsType>,
    options: OptionsType,
    specifier?: string
  ) {
    const context = this.makeCoordinatorContext(
      operation,
      plugin,
      options,
      specifier
    )
    await this.initCoordinator(plugin, context, specifier)
  }

  async initCoordinatorInternal<OptionsType>(
    operation: PluginOperation,
    plugin: Plugin<OptionsType>,
    options: OptionsType
  ) {
    const context = {
      ...this.makeCoordinatorContext(operation, plugin, options),
      emit: this.emit.bind(this),
    }
    await this.initCoordinator(plugin, context)
  }

  private async initCoordinator<OptionsType>(
    plugin: Plugin<OptionsType>,
    context: CoordinatorContext<OptionsType>,
    specifier?: string
  ) {
    const cleanupFn = await wrapErrorAsync(
      async () => await plugin.coordinator(context),
      `${formatCulprit(specifier)} errored when trying to init`
    )
    if (typeof cleanupFn === 'function') {
      this.cleanupFns.push({
        cleanupFn: cleanupFn,
        specifier,
      })
    }
  }

  private makeCoordinatorContext<OptionsType>(
    operation: PluginOperation,
    plugin: Plugin<OptionsType> | InternalPlugin<OptionsType>,
    options: OptionsType,
    specifier?: string
  ) {
    return {
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
  }

  emit<K extends CoordinatorEventKey>(
    event: K,
    value: CoordinatorEventValues[K]
  ): void {
    this.handlers[event].forEach(({ handler, specifier }) => {
      wrapError(
        () => handler(value),
        `${formatCulprit(specifier)} errored when trying to handle a "${event}" event`
      )
    })
  }

  async transform<K extends CoordinatorTransformKey>(
    event: K,
    value: CoordinatorTransformValues[K]
  ): Promise<CoordinatorTransformValues[K]> {
    let transformed = value
    for (const { transformer, specifier } of this.transformers[event]) {
      const returned = await wrapErrorAsync(
        async () => await transformer(transformed),
        `${formatCulprit(specifier)} errored when trying to do a "${event}" transform`
      )
      if (typeof returned !== 'undefined') {
        transformed = returned
      }
    }
    return transformed
  }

  async cleanup(): Promise<void> {
    for (const { cleanupFn, specifier } of this.cleanupFns) {
      await wrapErrorAsync(
        async () => await cleanupFn(),
        `${formatCulprit(specifier)} errored when trying to cleanup`
      )
    }
  }
}

function formatCulprit(specifier?: string) {
  return specifier ? `Plugin "${specifier}"` : 'Cucumber'
}

function wrapError<T>(fn: () => T, message: string): T {
  try {
    return fn()
  } catch (error) {
    throw new Error(message, { cause: error })
  }
}

async function wrapErrorAsync<T>(
  fn: () => Promise<T>,
  message: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    throw new Error(message, { cause: error })
  }
}
