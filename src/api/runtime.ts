import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import Runtime, { IRuntime } from '../runtime'
import { EventDataCollector } from '../formatter/helpers'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import Coordinator from '../runtime/parallel/coordinator'
import { ILogger } from '../logger'
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
  const pickleIds = filteredPickles.map((pickle) => pickle.pickle.id)
  if (parallel > 0) {
    return new Coordinator({
      cwd: environment.cwd,
      logger,
      eventBroadcaster,
      eventDataCollector,
      pickleIds,
      options,
      newId,
      supportCodeLibrary,
      numberOfWorkers: parallel,
    })
  }
  return new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId,
    pickleIds,
    supportCodeLibrary,
    options,
  })
}
