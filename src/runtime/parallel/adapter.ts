import { IAssembledTestCases } from '../assemble_test_cases'

export interface CoordinatorAdapter {
  start(assembledTestCases: IAssembledTestCases): Promise<boolean>
}
