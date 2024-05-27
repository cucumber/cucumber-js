import { EventEmitter } from 'node:events'
import { Envelope, IdGenerator } from '@cucumber/messages'
import { IRuntime } from '..'
import { timestamp } from '../stopwatch'
import { assembleTestCases } from '../assemble_test_cases'
import { EventDataCollector } from '../../formatter/helpers'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { CoordinatorAdapter } from './adapter'

interface Options {
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  newId: IdGenerator.NewId
  pickleIds: string[]
  supportCodeLibrary: SupportCodeLibrary
  adapter: CoordinatorAdapter
}

export default class Coordinator implements IRuntime {
  private readonly newId: IdGenerator.NewId
  private readonly eventBroadcaster: EventEmitter
  private readonly eventDataCollector: EventDataCollector
  private readonly supportCodeLibrary: SupportCodeLibrary
  private readonly pickleIds: string[]
  private readonly adapter: CoordinatorAdapter

  constructor(options: Options) {
    this.newId = options.newId
    this.eventBroadcaster = options.eventBroadcaster
    this.eventDataCollector = options.eventDataCollector
    this.supportCodeLibrary = options.supportCodeLibrary
    this.pickleIds = [...options.pickleIds]
    this.adapter = options.adapter
  }

  async start(): Promise<boolean> {
    this.eventBroadcaster.emit('envelope', {
      testRunStarted: {
        timestamp: timestamp(),
      },
    } satisfies Envelope)
    const assembledTestCases = await assembleTestCases({
      eventBroadcaster: this.eventBroadcaster,
      newId: this.newId,
      pickles: this.pickleIds.map((pickleId) =>
        this.eventDataCollector.getPickle(pickleId)
      ),
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
