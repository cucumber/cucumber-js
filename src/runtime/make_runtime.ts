import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import { IRunEnvironment, IRunOptionsRuntime } from '../api'
import { ILogger } from '../logger'
import { SourcedPickle } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { Runtime, RuntimeAdapter } from './types'
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
}: {
  environment: IRunEnvironment
  logger: ILogger
  eventBroadcaster: EventEmitter
  newId: IdGenerator.NewId
  sourcedPickles: ReadonlyArray<SourcedPickle>
  supportCodeLibrary: SupportCodeLibrary
  options: IRunOptionsRuntime
}): Promise<Runtime> {
  const adapter: RuntimeAdapter =
    options.parallel > 0
      ? new ChildProcessAdapter(
          environment,
          logger,
          eventBroadcaster,
          options,
          supportCodeLibrary
        )
      : new InProcessAdapter(
          eventBroadcaster,
          newId,
          options,
          supportCodeLibrary
        )
  return new Coordinator(
    eventBroadcaster,
    newId,
    sourcedPickles,
    supportCodeLibrary,
    adapter
  )
}
