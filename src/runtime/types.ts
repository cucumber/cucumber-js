import type { Exception } from '@cucumber/messages'
import type { JsonObject } from 'type-fest'
import type { AssembledTestCase } from '../assemble'

export interface RuntimeOptions {
  dryRun: boolean
  failFast: boolean
  filterStacktraces: boolean
  retry: number
  retryTagFilter: string
  strict: boolean
  worldParameters: JsonObject
}

export interface RuntimeResult {
  success: boolean
  exception?: Exception
}

export interface Runtime {
  run: () => Promise<RuntimeResult>
}

export interface RuntimeAdapter {
  setup(): Promise<void>
  runBeforeAllHooks(): Promise<boolean>
  runTestCases(assembledTestCases: ReadonlyArray<AssembledTestCase>): Promise<boolean>
  runAfterAllHooks(): Promise<boolean>
  teardown(): Promise<void>
}
