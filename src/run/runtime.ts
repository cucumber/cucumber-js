import Runtime, { IRuntime, IRuntimeOptions } from '../runtime'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../formatter/helpers'
import { IdGenerator } from '@cucumber/messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import Coordinator from '../runtime/parallel/coordinator'

export function makeRuntime({
  cwd,
  eventBroadcaster,
  eventDataCollector,
  pickleIds,
  newId,
  supportCodeLibrary,
  supportCodePaths,
  supportCodeRequiredModules,
  options,
}: {
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  newId: IdGenerator.NewId
  pickleIds: string[]
  supportCodeLibrary: ISupportCodeLibrary
  supportCodePaths: string[]
  supportCodeRequiredModules: string[]
  options: IRuntimeOptions & { parallel: number }
}): IRuntime {
  if (options.parallel > 0) {
    return new Coordinator({
      cwd,
      eventBroadcaster,
      eventDataCollector,
      pickleIds,
      options,
      newId,
      supportCodeLibrary,
      supportCodePaths,
      supportCodeRequiredModules,
      numberOfWorkers: options.parallel,
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
