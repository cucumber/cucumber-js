import { EventEmitter } from 'node:events'
import { Envelope, IdGenerator } from '@cucumber/messages'
import { IRuntime } from '..'
import { create, IStopwatch } from '../stopwatch'
import { assembleTestCases } from '../assemble_test_cases'
import { EventDataCollector } from '../../formatter/helpers'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import {
  INewCoordinatorOptions,
  MultiProcessCoordinatorAdapter,
} from './multi_process_coordinator_adapter'

export default class Coordinator implements IRuntime {
  private readonly stopwatch: IStopwatch = create()
  private readonly newId: IdGenerator.NewId
  private readonly eventBroadcaster: EventEmitter
  private readonly eventDataCollector: EventDataCollector
  private readonly supportCodeLibrary: SupportCodeLibrary
  private readonly pickleIds: string[]
  private readonly adapter: MultiProcessCoordinatorAdapter

  constructor(options: INewCoordinatorOptions) {
    this.newId = options.newId
    this.eventBroadcaster = options.eventBroadcaster
    this.eventDataCollector = options.eventDataCollector
    this.supportCodeLibrary = options.supportCodeLibrary
    this.pickleIds = [...options.pickleIds]
    this.adapter = new MultiProcessCoordinatorAdapter(options)
  }

  async start(): Promise<boolean> {
    this.eventBroadcaster.emit('envelope', {
      testRunStarted: {
        timestamp: this.stopwatch.timestamp(),
      },
    } satisfies Envelope)
    this.stopwatch.start()
    const assembledTestCases = await assembleTestCases({
      eventBroadcaster: this.eventBroadcaster,
      newId: this.newId,
      pickles: this.pickleIds.map((pickleId) =>
        this.eventDataCollector.getPickle(pickleId)
      ),
      supportCodeLibrary: this.supportCodeLibrary,
    })
    const success = await this.adapter.start(assembledTestCases)
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
