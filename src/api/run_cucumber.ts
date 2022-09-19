import { Envelope, IdGenerator, ParseError } from '@cucumber/messages'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../formatter/helpers'
import { emitMetaMessage, emitSupportCodeMessages } from '../cli/helpers'
import { IRunOptions, IRunEnvironment, IRunResult } from './types'
import { resolvePaths } from './paths'
import { makeRuntime } from './runtime'
import { initializeFormatters } from './formatters'
import { getSupportCodeLibrary } from './support'
import { mergeEnvironment } from './environment'
import { getFilteredPicklesAndErrors } from './gherkin'
import { initializePlugins } from './plugins'
import { ConsoleLogger } from './console_logger'
import { ILogger } from '../logger'

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
  const { cwd, stdout, stderr, env, debug } = mergeEnvironment(environment)
  const logger: ILogger = new ConsoleLogger(stderr, debug)

  const newId = IdGenerator.uuid()

  const supportCoordinates =
    'World' in configuration.support
      ? configuration.support.originalCoordinates
      : configuration.support

  const { unexpandedFeaturePaths, featurePaths, requirePaths, importPaths } =
    await resolvePaths(logger, cwd, configuration.sources, supportCoordinates)

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

  const plugins = await initializePlugins(logger, configuration, environment)

  const eventBroadcaster = new EventEmitter()
  if (onMessage) {
    eventBroadcaster.on('envelope', onMessage)
  }
  eventBroadcaster.on('envelope', (value) => plugins.emit('message', value))
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
  if (featurePaths.length > 0) {
    const gherkinResult = await getFilteredPicklesAndErrors({
      newId,
      cwd,
      logger,
      unexpandedFeaturePaths,
      featurePaths,
      coordinates: configuration.sources,
      onEnvelope: (envelope) => eventBroadcaster.emit('envelope', envelope),
    })
    pickleIds = gherkinResult.filteredPickles.map(({ pickle }) => pickle.id)
    parseErrors = gherkinResult.parseErrors
  }
  if (parseErrors.length) {
    parseErrors.forEach((parseError) => {
      logger.error(
        `Parse error in "${parseError.source.uri}" ${parseError.message}`
      )
    })
    await cleanupFormatters()
    await plugins.cleanup()
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
  await plugins.cleanup()

  return {
    success: success && !formatterStreamError,
    support: supportCodeLibrary,
  }
}
