import { EventEmitter } from 'node:events'
import { Envelope } from '@cucumber/messages'
import { IRuntime } from '..'
import { create, IStopwatch } from '../stopwatch'
import {
  INewCoordinatorOptions,
  MultiProcessCoordinatorAdapter,
} from './multi_process_coordinator_adapter'

export default class Coordinator implements IRuntime {
  private readonly stopwatch: IStopwatch = create()
  private readonly eventBroadcaster: EventEmitter
  private readonly adapter: MultiProcessCoordinatorAdapter

  constructor(options: INewCoordinatorOptions) {
    this.eventBroadcaster = options.eventBroadcaster
    this.adapter = new MultiProcessCoordinatorAdapter(options)
  }

  async start(): Promise<boolean> {
    this.eventBroadcaster.emit('envelope', {
      testRunStarted: {
        timestamp: this.stopwatch.timestamp(),
      },
    } satisfies Envelope)
    this.stopwatch.start()
    const success = await this.adapter.start()
    this.stopwatch.stop()
    this.eventBroadcaster.emit('envelope', {
      testRunFinished: {
        timestamp: this.stopwatch.timestamp(),
        success,
      },
    } satisfies Envelope)
    return success
  }
}
