import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import { assembleTestCases, SourcedPickle } from '../assemble'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { RuntimeAdapter } from './types'
import { Runtime } from './index'

/**
 * Handles the high-level coordination of the test run on the main thread
 * @returns whether all hooks and test cases were successful
 * @remarks
 * For each phase of the test run, delegates to a {@link RuntimeAdapter} to handle
 * the work itself. Unaware of how the adapter distributes and executes work.
 */
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
    try {
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
        successByPhase.testCases =
          await this.adapter.runTestCases(assembledTestCases)
      }
      successByPhase.afterAllHooks = await this.adapter.runAfterAllHooks()
      return (
        successByPhase.beforeAllHooks &&
        successByPhase.testCases &&
        successByPhase.afterAllHooks
      )
    } finally {
      await this.adapter.teardown()
    }
  }
}
