import { AssembledTestCase } from '../assemble'

export interface CoordinatorAdapter {
  start(assembledTestCases: ReadonlyArray<AssembledTestCase>): Promise<boolean>
}

export interface WorkerAdapter {}
