import { EventEmitter } from 'node:events'
import { Envelope, IdGenerator } from '@cucumber/messages'
import { IFilterablePickle } from '../filter'
import { assembleTestCases } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { RuntimeAdapter } from './types'
import { timestamp } from './stopwatch'
import { IRuntime } from './index'

export class Coordinator implements IRuntime {
  constructor(
    private eventBroadcaster: EventEmitter,
    private newId: IdGenerator.NewId,
    private filteredPickles: ReadonlyArray<IFilterablePickle>,
    private supportCodeLibrary: SupportCodeLibrary,
    private adapter: RuntimeAdapter
  ) {}

  async start(): Promise<boolean> {
    this.eventBroadcaster.emit('envelope', {
      testRunStarted: {
        timestamp: timestamp(),
      },
    } satisfies Envelope)

    const assembledTestCases = await assembleTestCases({
      eventBroadcaster: this.eventBroadcaster,
      newId: this.newId,
      filteredPickles: this.filteredPickles,
      supportCodeLibrary: this.supportCodeLibrary,
    })

    const success = await this.adapter.start(assembledTestCases)

    this.eventBroadcaster.emit('envelope', {
      testRunFinished: {
        timestamp: timestamp(),
        success,
      },
    } satisfies Envelope)

    return success
  }
}
