import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import { IRuntime } from '../runtime'
import { EventDataCollector } from '../formatter/helpers'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { ILogger } from '../logger'
import { Coordinator } from '../runtime/coordinator'
import { ChildProcessAdapter } from '../runtime/parallel/adapter'
import { IFilterablePickle } from '../filter'
import { InProcessAdapter } from '../runtime/serial/adapter'
import { RuntimeAdapter } from '../runtime/types'
import { IRunEnvironment, IRunOptionsRuntime } from './types'

export async function makeRuntime({
  environment,
  logger,
  eventBroadcaster,
  eventDataCollector,
  filteredPickles,
  newId,
  supportCodeLibrary,
  options,
}: {
  environment: IRunEnvironment
  logger: ILogger
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  newId: IdGenerator.NewId
  filteredPickles: ReadonlyArray<IFilterablePickle>
  supportCodeLibrary: SupportCodeLibrary
  options: IRunOptionsRuntime
}): Promise<IRuntime> {
  const adapter: RuntimeAdapter =
    options.parallel > 0
      ? new ChildProcessAdapter(
          environment,
          logger,
          eventBroadcaster,
          eventDataCollector,
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
    filteredPickles,
    supportCodeLibrary,
    adapter
  )
}
