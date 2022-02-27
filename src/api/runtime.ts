import Runtime, {
  DEFAULT_RUNTIME_OPTIONS,
  IRuntime,
  IRuntimeOptions,
} from '../runtime'
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
  requireModules,
  requirePaths,
  importPaths,
  options: { parallel = 0, ...runtimeOptions } = {},
}: {
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  newId: IdGenerator.NewId
  pickleIds: string[]
  supportCodeLibrary: ISupportCodeLibrary
  requireModules: string[]
  requirePaths: string[]
  importPaths: string[]
  options: Partial<IRuntimeOptions> & { parallel?: number }
}): IRuntime {
  // sprinkle specified runtime options over the defaults
  const options = {
    ...DEFAULT_RUNTIME_OPTIONS,
    ...runtimeOptions,
  }
  if (parallel > 0) {
    return new Coordinator({
      cwd,
      eventBroadcaster,
      eventDataCollector,
      pickleIds,
      options,
      newId,
      supportCodeLibrary,
      requireModules,
      requirePaths,
      importPaths,
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
