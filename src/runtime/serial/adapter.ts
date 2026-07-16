import type { EventEmitter } from 'node:events'
import type { IdGenerator } from '@cucumber/messages'
import type { AssembledTestCase } from '../../assemble'
import type StepDefinitionSnippetBuilder from '../../formatter/step_definition_snippet_builder'
import type { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { Executor } from '../executor'
import type { RuntimeOptions } from '../index'
import type { RuntimeAdapter } from '../types'

/**
 * A simple adapter that executes all work in serial on the main thread
 */
export class InProcessAdapter implements RuntimeAdapter {
  private readonly executor: Executor

  constructor(
    testRunStartedId: string,
    eventBroadcaster: EventEmitter,
    newId: IdGenerator.NewId,
    options: RuntimeOptions,
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
      if (!(await this.executor.runTestCase(item, failing))) {
        failing = true
      }
    }
    return !failing
  }

  async runAfterAllHooks() {
    return await this.executor.runAfterAllHooks()
  }
}
