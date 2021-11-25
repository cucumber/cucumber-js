import { IFormatterStream } from '../formatter'
import { IdGenerator } from '@cucumber/messages'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../formatter/helpers'
import {
  emitMetaMessage,
  emitSupportCodeMessages,
  parseGherkinMessageStream,
} from '../cli/helpers'
import { GherkinStreams } from '@cucumber/gherkin-streams'
import PickleFilter from '../pickle_filter'
import { IRunConfiguration } from '../configuration'
import { IRunResult } from './types'
import { resolvePaths } from './paths'
import { makeRuntime } from './runtime'
import { initializeFormatters } from './formatters'
import { getSupportCodeLibrary } from './support'

export async function runCucumber(
  configuration: IRunConfiguration,
  environment: {
    cwd: string
    stdout: IFormatterStream
    env: NodeJS.ProcessEnv
  } = {
    cwd: process.cwd(),
    stdout: process.stdout,
    env: process.env,
  }
): Promise<IRunResult> {
  const { cwd, stdout, env } = environment
  const newId = IdGenerator.uuid()

  const { unexpandedFeaturePaths, featurePaths, supportCodePaths } =
    await resolvePaths(cwd, configuration)

  const supportCodeLibrary = await getSupportCodeLibrary({
    cwd,
    newId,
    supportCodePaths,
    supportCodeRequiredModules: configuration.support.transpileWith,
  })

  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)

  const cleanup = await initializeFormatters({
    cwd,
    stdout,
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

  if (featurePaths.length > 0) {
    pickleIds = await parseGherkinMessageStream({
      cwd,
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
  emitSupportCodeMessages({
    eventBroadcaster,
    supportCodeLibrary,
    newId,
  })

  const runtime = makeRuntime({
    cwd,
    eventBroadcaster,
    eventDataCollector,
    pickleIds,
    newId,
    supportCodeLibrary,
    supportCodePaths,
    supportCodeRequiredModules: configuration.support.transpileWith,
    options: configuration.runtime,
  })
  const success = await runtime.start()
  await cleanup()

  return {
    success,
    support: supportCodeLibrary,
  }
}
