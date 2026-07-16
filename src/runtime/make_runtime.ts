import type { EventEmitter } from 'node:events'
import type { IdGenerator } from '@cucumber/messages'
import type { IRunOptionsRuntime } from '../api'
import type { SourcedPickle } from '../assemble'
import type { ILogger, IRunEnvironment } from '../environment'
import type { FormatOptions } from '../formatter'
import FormatterBuilder from '../formatter/builder'
import type { SupportCodeLibrary } from '../support_code_library_builder/types'
import { Coordinator } from './coordinator'
import { WorkerThreadsAdapter } from './parallel/adapter'
import { InProcessAdapter } from './serial/adapter'
import type { Runtime } from './types'

export async function makeRuntime({
  testRunStartedId,
  environment,
  logger,
  eventBroadcaster,
  sourcedPickles,
  newId,
  supportCodeLibrary,
  options,
  snippetOptions,
}: {
  testRunStartedId: string
  environment: IRunEnvironment
  logger: ILogger
  eventBroadcaster: EventEmitter
  newId: IdGenerator.NewId
  sourcedPickles: ReadonlyArray<SourcedPickle>
  supportCodeLibrary: SupportCodeLibrary
  options: IRunOptionsRuntime
  snippetOptions: Pick<FormatOptions, 'snippetInterface' | 'snippetSyntax'>
}): Promise<Runtime> {
  const adapter = await makeAdapter(
    options,
    snippetOptions,
    testRunStartedId,
    environment,
    logger,
    eventBroadcaster,
    supportCodeLibrary,
    newId
  )
  return new Coordinator(
    testRunStartedId,
    eventBroadcaster,
    newId,
    sourcedPickles,
    supportCodeLibrary,
    options.filterStacktraces,
    adapter
  )
}

async function makeAdapter(
  options: IRunOptionsRuntime,
  snippetOptions: Pick<FormatOptions, 'snippetInterface' | 'snippetSyntax'>,
  testRunStartedId: string,
  environment: IRunEnvironment,
  logger: ILogger,
  eventBroadcaster: EventEmitter,
  supportCodeLibrary: SupportCodeLibrary,
  newId: () => string
) {
  const snippetBuilder = await FormatterBuilder.getStepDefinitionSnippetBuilder({
    cwd: environment.cwd,
    snippetInterface: snippetOptions.snippetInterface,
    snippetSyntax: snippetOptions.snippetSyntax,
    supportCodeLibrary,
  })
  if (options.parallel > 0) {
    return new WorkerThreadsAdapter(
      testRunStartedId,
      environment,
      logger,
      eventBroadcaster,
      newId,
      options,
      snippetOptions,
      supportCodeLibrary,
      snippetBuilder
    )
  }
  return new InProcessAdapter(
    testRunStartedId,
    eventBroadcaster,
    newId,
    options,
    supportCodeLibrary,
    snippetBuilder
  )
}
