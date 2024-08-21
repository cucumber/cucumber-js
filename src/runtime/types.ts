import { AssembledTestCase } from '../assemble'

export interface RuntimeAdapter {
  start(assembledTestCases: ReadonlyArray<AssembledTestCase>): Promise<boolean>
}
