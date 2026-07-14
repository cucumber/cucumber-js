import type { EventEmitter } from 'node:events'
import type { IdGenerator } from '@cucumber/messages'
import { assembleTestCases, type SourcedPickle } from '../assemble'
import type { SupportCodeLibrary } from '../support_code_library_builder/types'
import { formatError } from './format_error'
import type { Runtime } from './index'
import type { RuntimeAdapter, RuntimeResult } from './types'

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

  async run(): Promise<RuntimeResult> {
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
        successByPhase.testCases = await this.adapter.runTestCases(assembledTestCases)
      }
      successByPhase.afterAllHooks = await this.adapter.runAfterAllHooks()
      return {
        success:
          successByPhase.beforeAllHooks && successByPhase.testCases && successByPhase.afterAllHooks,
      }
    } catch (error: unknown) {
      return {
        success: false,
        exception: formatError(error as Error, false).exception,
      }
    } finally {
      await this.adapter.teardown()
    }
  }
}
