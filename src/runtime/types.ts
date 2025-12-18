import { JsonObject } from 'type-fest'
import { AssembledTestCase } from '../assemble'

export interface RuntimeOptions {
  dryRun: boolean
  failFast: boolean
  filterStacktraces: boolean
  retry: number
  retryTagFilter: string
  strict: boolean
  worldParameters: JsonObject
}

export interface Runtime {
  run: () => Promise<boolean>
}

export interface RuntimeAdapter {
  setup(): Promise<void>
  runBeforeAllHooks(): Promise<boolean>
  runTestCases(
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ): Promise<boolean>
  runAfterAllHooks(): Promise<boolean>
  teardown(): Promise<void>
}
