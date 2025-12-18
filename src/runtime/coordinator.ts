import { EventEmitter } from 'node:events'
import { Envelope, IdGenerator } from '@cucumber/messages'
import { assembleTestCases, SourcedPickle } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { RuntimeAdapter } from './types'
import { timestamp } from './stopwatch'
import { Runtime } from './index'

export class Coordinator implements Runtime {
  constructor(
    private testRunStartedId: string,
    private eventBroadcaster: EventEmitter,
    private newId: IdGenerator.NewId,
    private sourcedPickles: ReadonlyArray<SourcedPickle>,
    private supportCodeLibrary: SupportCodeLibrary,
    private adapter: RuntimeAdapter
  ) {}

  async run(): Promise<boolean> {
    this.eventBroadcaster.emit('envelope', {
      testRunStarted: {
        id: this.testRunStartedId,
        timestamp: timestamp(),
      },
    } satisfies Envelope)

    await this.adapter.setup()

    const successByPhase = {
      beforeAllHooks: false,
      testCases: false,
      afterAllHooks: false,
    }
    successByPhase.beforeAllHooks = await this.adapter.runBeforeAllHooks()
    if (successByPhase.beforeAllHooks) {
      const assembledTestCases = await assembleTestCases(
        this.testRunStartedId,
        this.eventBroadcaster,
        this.newId,
        this.sourcedPickles,
        this.supportCodeLibrary
      )
      successByPhase.testCases = await this.adapter.runTestCases(assembledTestCases)
    }
    successByPhase.afterAllHooks = await this.adapter.runAfterAllHooks()
    const success = successByPhase.beforeAllHooks && successByPhase.testCases && successByPhase.afterAllHooks

    await this.adapter.teardown()

    this.eventBroadcaster.emit('envelope', {
      testRunFinished: {
        testRunStartedId: this.testRunStartedId,
        timestamp: timestamp(),
        success,
      },
    } satisfies Envelope)

    return success
  }
}
