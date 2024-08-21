import { EventEmitter } from 'node:events'
import { Envelope, IdGenerator } from '@cucumber/messages'
import { assembleTestCases, SourcedPickle } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { RuntimeAdapter } from './types'
import { timestamp } from './stopwatch'
import { Runtime } from './index'

export class Coordinator implements Runtime {
  constructor(
    private eventBroadcaster: EventEmitter,
    private newId: IdGenerator.NewId,
    private sourcedPickles: ReadonlyArray<SourcedPickle>,
    private supportCodeLibrary: SupportCodeLibrary,
    private adapter: RuntimeAdapter
  ) {}

  async run(): Promise<boolean> {
    this.eventBroadcaster.emit('envelope', {
      testRunStarted: {
        timestamp: timestamp(),
      },
    } satisfies Envelope)

    const assembledTestCases = await assembleTestCases({
      eventBroadcaster: this.eventBroadcaster,
      newId: this.newId,
      sourcedPickles: this.sourcedPickles,
      supportCodeLibrary: this.supportCodeLibrary,
    })

    const success = await this.adapter.run(assembledTestCases)

    this.eventBroadcaster.emit('envelope', {
      testRunFinished: {
        timestamp: timestamp(),
        success,
      },
    } satisfies Envelope)

    return success
  }
}
