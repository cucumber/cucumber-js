import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import { RuntimeAdapter } from '../types'
import { AssembledTestCase } from '../../assemble'
import { Worker } from '../worker'
import { RuntimeOptions } from '../index'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import StepDefinitionSnippetBuilder from '../../formatter/step_definition_snippet_builder'

export class InProcessAdapter implements RuntimeAdapter {
  private readonly worker: Worker
  private failing: boolean = false

  constructor(
    testRunStartedId: string,
    eventBroadcaster: EventEmitter,
    newId: IdGenerator.NewId,
    options: RuntimeOptions,
    supportCodeLibrary: SupportCodeLibrary,
    snippetBuilder: StepDefinitionSnippetBuilder
  ) {
    this.worker = new Worker(
      testRunStartedId,
      undefined,
      eventBroadcaster,
      newId,
      options,
      supportCodeLibrary,
      snippetBuilder
    )
  }

  async run(
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ): Promise<boolean> {
    await this.worker.runBeforeAllHooks()
    for (const item of assembledTestCases) {
      const success = await this.worker.runTestCase(item, this.failing)
      if (!success) {
        this.failing = true
      }
    }
    await this.worker.runAfterAllHooks()
    return !this.failing
  }
}
