import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import { IRunOptionsRuntime } from '../api'
import { ILogger, IRunEnvironment } from '../environment'
import { SourcedPickle } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import FormatterBuilder from '../formatter/builder'
import { FormatOptions } from '../formatter'
import { Runtime } from './types'
import { ChildProcessAdapter } from './parallel/adapter'
import { InProcessAdapter } from './serial/adapter'
import { Coordinator } from './coordinator'

export async function makeRuntime({
  environment,
  logger,
  eventBroadcaster,
  sourcedPickles,
  newId,
  supportCodeLibrary,
  options,
  snippetOptions,
}: {
  environment: IRunEnvironment
  logger: ILogger
  eventBroadcaster: EventEmitter
  newId: IdGenerator.NewId
  sourcedPickles: ReadonlyArray<SourcedPickle>
  supportCodeLibrary: SupportCodeLibrary
  options: IRunOptionsRuntime
  snippetOptions: Pick<FormatOptions, 'snippetInterface' | 'snippetSyntax'>
}): Promise<Runtime> {
  const testRunStartedId = newId()
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
  const snippetBuilder = await FormatterBuilder.getStepDefinitionSnippetBuilder(
    {
      cwd: environment.cwd,
      snippetInterface: snippetOptions.snippetInterface,
      snippetSyntax: snippetOptions.snippetSyntax,
      supportCodeLibrary,
    }
  )
  if (options.parallel > 0) {
    return new ChildProcessAdapter(
      testRunStartedId,
      environment,
      logger,
      eventBroadcaster,
      options,
      snippetOptions,
      supportCodeLibrary
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
