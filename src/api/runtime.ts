import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { ILogger } from '../logger'
import { Runtime, Coordinator, RuntimeAdapter } from '../runtime'
import { ChildProcessAdapter } from '../runtime/parallel/adapter'
import { InProcessAdapter } from '../runtime/serial/adapter'
import { SourcedPickle } from '../assemble'
import { IRunEnvironment, IRunOptionsRuntime } from './types'

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
