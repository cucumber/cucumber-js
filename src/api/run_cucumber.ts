import { EventEmitter } from 'node:events'
import { Envelope, IdGenerator, ParseError } from '@cucumber/messages'
import { EventDataCollector } from '../formatter/helpers'
import { emitMetaMessage, emitSupportCodeMessages } from '../cli/helpers'
import { resolvePaths } from '../paths'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { IRunOptions, IRunEnvironment, IRunResult } from './types'
import { makeRuntime } from './runtime'
import { initializeFormatters } from './formatters'
import { getSupportCodeLibrary } from './support'
import { mergeEnvironment } from './environment'
import { getPicklesAndErrors } from './gherkin'
import { initializeForRunCucumber } from './plugins'

/**
 * Execute a Cucumber test run and return the overall result
 *
 * @public
 * @param options - Options for the run, obtainable via {@link loadConfiguration}
 * @param environment - Project environment
 * @param onMessage - Callback fired each time Cucumber emits a message
 */
export async function runCucumber(
  options: IRunOptions,
  environment: IRunEnvironment = {},
  onMessage?: (message: Envelope) => void
): Promise<IRunResult> {
  const mergedEnvironment = mergeEnvironment(environment)
  const { cwd, stdout, stderr, env, logger } = mergedEnvironment

  const newId = IdGenerator.uuid()

  const supportCoordinates =
    'originalCoordinates' in options.support
      ? options.support.originalCoordinates
      : options.support

  const pluginManager = await initializeForRunCucumber(
    logger,
    {
      ...options,
      support: supportCoordinates,
    },
    mergedEnvironment
  )

  const resolvedPaths = await resolvePaths(
    logger,
    cwd,
    options.sources,
    supportCoordinates
  )
  pluginManager.emit('paths:resolve', resolvedPaths)
  const { sourcePaths, requirePaths, importPaths } = resolvedPaths

  const supportCodeLibrary =
    'originalCoordinates' in options.support
      ? (options.support as SupportCodeLibrary)
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
    configuration: options.formats,
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
      coordinates: options.sources,
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
    options: options.runtime,
  })
  const success = await runtime.start()
  await cleanupFormatters()
  await pluginManager.cleanup()

  return {
    success: success && !formatterStreamError,
    support: supportCodeLibrary,
  }
}
