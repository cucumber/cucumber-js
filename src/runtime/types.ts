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
  run(assembledTestCases: ReadonlyArray<AssembledTestCase>): Promise<boolean>
}
