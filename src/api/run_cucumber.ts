import { EventEmitter } from 'node:events'
import { Envelope, IdGenerator, ParseError } from '@cucumber/messages'
import { EventDataCollector } from '../formatter/helpers'
import { emitMetaMessage, emitSupportCodeMessages } from '../cli/helpers'
import { ILogger } from '../logger'
import { resolvePaths } from '../paths'
import { IRunOptions, IRunEnvironment, IRunResult } from './types'
import { makeRuntime } from './runtime'
import { initializeFormatters } from './formatters'
import { getSupportCodeLibrary } from './support'
import { mergeEnvironment } from './environment'
import { getPicklesAndErrors } from './gherkin'
import { initializeForRunCucumber } from './plugins'
import { ConsoleLogger } from './console_logger'

/**
 * Execute a Cucumber test run.
 *
 * @public
 * @param configuration - Configuration loaded from `loadConfiguration`.
 * @param environment - Project environment.
 * @param onMessage - Callback fired each time Cucumber emits a message.
 */
export async function runCucumber(
  configuration: IRunOptions,
  environment: IRunEnvironment = {},
  onMessage?: (message: Envelope) => void
): Promise<IRunResult> {
  const mergedEnvironment = mergeEnvironment(environment)
  const { cwd, stdout, stderr, env, debug } = mergedEnvironment
  const logger: ILogger = new ConsoleLogger(stderr, debug)

  const newId = IdGenerator.uuid()

  const supportCoordinates =
    'World' in configuration.support
      ? configuration.support.originalCoordinates
      : configuration.support

  const pluginManager = await initializeForRunCucumber(
    logger,
    {
      ...configuration,
      support: supportCoordinates,
    },
    mergedEnvironment
  )

  const resolvedPaths = await resolvePaths(
    logger,
    cwd,
    configuration.sources,
    supportCoordinates
  )
  pluginManager.emit('paths:resolve', resolvedPaths)
  const { sourcePaths, requirePaths, importPaths } = resolvedPaths

  const supportCodeLibrary =
    'World' in configuration.support
      ? configuration.support
      : await getSupportCodeLibrary({
          cwd,
          newId,
          requirePaths,
          importPaths,
          requireModules: supportCoordinates.requireModules,
        })

  const eventBroadcaster = new EventEmitter()
  if (onMessage) {
    eventBroadcaster.on('envelope', onMessage)
  }
  eventBroadcaster.on('envelope', (value) =>
    pluginManager.emit('message', value)
  )
  const eventDataCollector = new EventDataCollector(eventBroadcaster)

  let formatterStreamError = false
  const cleanupFormatters = await initializeFormatters({
    env,
    cwd,
    stdout,
    stderr,
    logger,
    onStreamError: () => (formatterStreamError = true),
    eventBroadcaster,
    eventDataCollector,
    configuration: configuration.formats,
    supportCodeLibrary,
  })
  await emitMetaMessage(eventBroadcaster, env)

  let pickleIds: string[] = []
  let parseErrors: ParseError[] = []
  if (sourcePaths.length > 0) {
    const gherkinResult = await getPicklesAndErrors({
      newId,
      cwd,
      sourcePaths,
      coordinates: configuration.sources,
      onEnvelope: (envelope) => eventBroadcaster.emit('envelope', envelope),
    })
    const filteredPickles = await pluginManager.transform(
      'pickles:filter',
      gherkinResult.filterablePickles
    )
    const orderedPickles = await pluginManager.transform(
      'pickles:order',
      filteredPickles
    )
    pickleIds = orderedPickles.map(({ pickle }) => pickle.id)
    parseErrors = gherkinResult.parseErrors
  }
  if (parseErrors.length) {
    parseErrors.forEach((parseError) => {
      logger.error(
        `Parse error in "${parseError.source.uri}" ${parseError.message}`
      )
    })
    await cleanupFormatters()
    await pluginManager.cleanup()
    return {
      success: false,
      support: supportCodeLibrary,
    }
  }

  emitSupportCodeMessages({
    eventBroadcaster,
    supportCodeLibrary,
    newId,
  })

  const runtime = makeRuntime({
    cwd,
    logger,
    eventBroadcaster,
    eventDataCollector,
    pickleIds,
    newId,
    supportCodeLibrary,
    requireModules: supportCoordinates.requireModules,
    requirePaths,
    importPaths,
    options: configuration.runtime,
  })
  const success = await runtime.start()
  await cleanupFormatters()
  await pluginManager.cleanup()

  return {
    success: success && !formatterStreamError,
    support: supportCodeLibrary,
  }
}
