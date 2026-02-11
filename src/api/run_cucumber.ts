import { EventEmitter } from 'node:events'
import { Envelope, IdGenerator, ParseError } from '@cucumber/messages'
import { IRunEnvironment, makeEnvironment } from '../environment'
import { IFilterablePickle } from '../filter'
import { EventDataCollector } from '../formatter/helpers'
import { resolvePaths } from '../paths'
import { makeRuntime } from '../runtime'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { version } from '../version'
import {
  emitMetaMessage,
  emitSupportCodeMessages,
} from './emit_support_code_messages'
import { initializeFormatters } from './formatters'
import { getPicklesAndErrors } from './gherkin'
import { initializeForRunCucumber } from './plugins'
import { getSupportCodeLibrary } from './support'
import { IRunOptions, IRunResult } from './types'

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
  const mergedEnvironment = makeEnvironment(environment)
  const { cwd, stdout, stderr, env, logger } = mergedEnvironment

  logger.debug(`Running cucumber-js ${version} 
Working directory: ${cwd}
Running from: ${__dirname}  
`)

  const newId = IdGenerator.uuid()

  const supportCoordinates =
    'originalCoordinates' in options.support
      ? options.support.originalCoordinates
      : Object.assign(
          {
            requireModules: [],
            requirePaths: [],
            loaders: [],
            importPaths: [],
          },
          options.support
        )

  const pluginManager = await initializeForRunCucumber(
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
          logger,
          cwd,
          newId,
          requirePaths,
          requireModules: supportCoordinates.requireModules,
          importPaths,
          loaders: supportCoordinates.loaders,
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
    pluginManager,
  })
  await emitMetaMessage(eventBroadcaster, env)

  let filteredPickles: ReadonlyArray<IFilterablePickle> = []
  let parseErrors: ParseError[] = []
  if (sourcePaths.length > 0) {
    const gherkinResult = await getPicklesAndErrors({
      newId,
      cwd,
      sourcePaths,
      coordinates: options.sources,
      onEnvelope: (envelope) => eventBroadcaster.emit('envelope', envelope),
    })
    filteredPickles = await pluginManager.transform(
      'pickles:filter',
      gherkinResult.filterablePickles
    )
    filteredPickles = await pluginManager.transform(
      'pickles:order',
      filteredPickles
    )
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

  const runtime = await makeRuntime({
    environment: mergedEnvironment,
    logger,
    eventBroadcaster,
    sourcedPickles: filteredPickles,
    newId,
    supportCodeLibrary,
    options: options.runtime,
    snippetOptions: options.formats.options,
  })
  const success = await runtime.run()
  await pluginManager.cleanup()
  await cleanupFormatters()

  return {
    success: success && !formatterStreamError,
    support: supportCodeLibrary,
  }
}
