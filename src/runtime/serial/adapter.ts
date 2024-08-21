import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import { RuntimeAdapter } from '../types'
import { AssembledTestCase } from '../../assemble'
import { Worker } from '../worker'
import { RuntimeOptions } from '../index'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'

export class InProcessAdapter implements RuntimeAdapter {
  #failing: boolean = false
  #worker: Worker

  constructor(
    eventBroadcaster: EventEmitter,
    newId: IdGenerator.NewId,
    options: RuntimeOptions,
    supportCodeLibrary: SupportCodeLibrary
  ) {
    this.#worker = new Worker(
      undefined,
      eventBroadcaster,
      newId,
      options,
      supportCodeLibrary
    )
  }

  async run(
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ): Promise<boolean> {
    await this.#worker.runBeforeAllHooks()
    for (const item of assembledTestCases) {
      const success = await this.#worker.runTestCase(item, this.#failing)
      if (!success) {
        this.#failing = true
      }
    }
    await this.#worker.runAfterAllHooks()
    return !this.#failing
  }
}
