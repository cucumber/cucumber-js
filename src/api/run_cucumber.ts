import { Envelope, IdGenerator, ParseError } from '@cucumber/messages'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../formatter/helpers'
import {
  emitMetaMessage,
  emitSupportCodeMessages,
  parseGherkinMessageStream,
} from '../cli/helpers'
import { GherkinStreams } from '@cucumber/gherkin-streams'
import PickleFilter from '../pickle_filter'
import { IDynamicRunConfiguration, IRunEnvironment, IRunResult } from './types'
import { resolvePaths } from './paths'
import { makeRuntime } from './runtime'
import { initializeFormatters } from './formatters'
import { getSupportCodeLibrary } from './support'
import { Console } from 'console'
import * as messages from '@cucumber/messages'
import { doesHaveValue } from '../value_checker'

export async function runCucumber(
  configuration: IDynamicRunConfiguration,
  {
    cwd = process.cwd(),
    stdout = process.stdout,
    stderr = process.stderr,
    env = process.env,
  }: Partial<IRunEnvironment>,
  onMessage?: (message: Envelope) => void
): Promise<IRunResult> {
  const logger = new Console(stdout, stderr)
  const newId = IdGenerator.uuid()

  const supportCoordinates =
    'World' in configuration.support
      ? configuration.support.originalCoordinates
      : configuration.support

  const { unexpandedFeaturePaths, featurePaths, requirePaths, importPaths } =
    await resolvePaths(cwd, configuration.sources, supportCoordinates)

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
  const eventDataCollector = new EventDataCollector(eventBroadcaster)

  let formatterStreamError = false
  const cleanup = await initializeFormatters({
    cwd,
    stdout,
    logger,
    onStreamError: () => (formatterStreamError = true),
    eventBroadcaster,
    eventDataCollector,
    configuration: configuration.formats,
    supportCodeLibrary,
  })
  await emitMetaMessage(eventBroadcaster, env)

  const gherkinMessageStream = GherkinStreams.fromPaths(featurePaths, {
    defaultDialect: configuration.sources.defaultDialect,
    newId,
    relativeTo: cwd,
  })
  let pickleIds: string[] = []
  const parseErrors: ParseError[] = []
  gherkinMessageStream.on('data', (envelope: messages.Envelope) => {
    if (doesHaveValue(envelope.parseError)) {
      parseErrors.push(envelope.parseError)
    }
  })

  if (featurePaths.length > 0) {
    pickleIds = await parseGherkinMessageStream({
      logger,
      eventBroadcaster,
      eventDataCollector,
      gherkinMessageStream,
      order: configuration.sources.order ?? 'defined',
      pickleFilter: new PickleFilter({
        cwd,
        featurePaths: unexpandedFeaturePaths,
        names: configuration.sources.names,
        tagExpression: configuration.sources.tagExpression,
      }),
    })
  }

  if (parseErrors.length) {
    parseErrors.forEach((parseError) => {
      logger.error(
        `Parse error in "${parseError.source.uri}" ${parseError.message}`
      )
    })
    await cleanup()
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
  await cleanup()

  return {
    success: success && !formatterStreamError,
    support: supportCodeLibrary,
  }
}
