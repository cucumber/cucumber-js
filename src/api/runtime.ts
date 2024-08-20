import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import Runtime, { IRuntime } from '../runtime'
import { EventDataCollector } from '../formatter/helpers'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { ILogger } from '../logger'
import { Coordinator } from '../runtime/coordinator'
import { ChildProcessCoordinatorAdapter } from '../runtime/parallel/coordinator_adapter'
import { IFilterablePickle } from '../filter'
import { IRunEnvironment, IRunOptionsRuntime } from './types'

export async function makeRuntime({
  environment,
  logger,
  eventBroadcaster,
  eventDataCollector,
  filteredPickles,
  newId,
  supportCodeLibrary,
  options: { parallel, ...options },
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
  if (parallel > 0) {
    return new Coordinator(
      eventBroadcaster,
      newId,
      filteredPickles,
      supportCodeLibrary,
      new ChildProcessCoordinatorAdapter({
        cwd: environment.cwd,
        logger,
        eventBroadcaster,
        eventDataCollector,
        options,
        supportCodeLibrary,
        numberOfWorkers: parallel,
      })
    )
  }
  return new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId,
    pickleIds: filteredPickles.map(({ pickle }) => pickle.id),
    supportCodeLibrary,
    options,
  })
}
