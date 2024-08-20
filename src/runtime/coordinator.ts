import { EventEmitter } from 'node:events'
import { Envelope } from '@cucumber/messages'
import { CoordinatorAdapter } from './types'
import { timestamp } from './stopwatch'
import { IRuntime } from './index'

export class Coordinator implements IRuntime {
  constructor(
    private eventBroadcaster: EventEmitter,
    private adapter: CoordinatorAdapter
  ) {}

  async start(): Promise<boolean> {
    this.eventBroadcaster.emit('envelope', {
      testRunStarted: {
        timestamp: timestamp(),
      },
    } satisfies Envelope)
    const success = await this.adapter.start()
    this.eventBroadcaster.emit('envelope', {
      testRunFinished: {
        timestamp: timestamp(),
        success,
      },
    } satisfies Envelope)
    return success
  }
}
