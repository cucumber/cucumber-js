import type { EventEmitter } from 'node:events'
import type { IdGenerator, TestStepResultStatus } from '@cucumber/messages'
import type { AssembledTestCase } from '../../assemble'
import type StepDefinitionSnippetBuilder from '../../formatter/step_definition_snippet_builder'
import type { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { AttemptManager } from '../attempt_manager'
import { Executor } from '../executor'
import { shouldCauseFailure } from '../helpers'
import type { RuntimeOptions } from '../index'
import type { RuntimeAdapter } from '../types'

/**
 * A simple adapter that executes all work in serial on the main thread
 */
export class InProcessAdapter implements RuntimeAdapter {
  private readonly executor: Executor
  private readonly attemptManager: AttemptManager

  constructor(
    testRunStartedId: string,
    eventBroadcaster: EventEmitter,
    newId: IdGenerator.NewId,
    private readonly options: RuntimeOptions,
    supportCodeLibrary: SupportCodeLibrary,
    snippetBuilder: StepDefinitionSnippetBuilder
  ) {
    this.executor = new Executor(
      testRunStartedId,
      undefined,
      eventBroadcaster,
      newId,
      options,
      supportCodeLibrary,
      snippetBuilder
    )
    this.attemptManager = new AttemptManager(eventBroadcaster, options)
  }

  async setup() {
    // no-op for serial runtime
  }

  async teardown() {
    // no-op for serial runtime
  }

  async runBeforeAllHooks() {
    return await this.executor.runBeforeAllHooks()
  }

  async runTestCases(assembledTestCases: ReadonlyArray<AssembledTestCase>) {
    let failing = false
    for (const item of assembledTestCases) {
      const skip = this.options.dryRun || (this.options.failFast && failing)
      let spec = this.attemptManager.start(item.pickle, skip)
      let status: TestStepResultStatus
      do {
        const result = await this.executor.runTestCaseAttempt(item, spec)
        status = result.status
        spec = this.attemptManager.finish(item.pickle, result)
      } while (spec)
      // only the final attempt's outcome counts towards fail-fast
      if (shouldCauseFailure(status, this.options)) {
        failing = true
      }
    }
    return !failing
  }

  async runAfterAllHooks() {
    return await this.executor.runAfterAllHooks()
  }
}
