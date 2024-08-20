import { GherkinDocument, Pickle, TestCase } from '@cucumber/messages'
import * as messages from '@cucumber/messages'

export declare type TestCasesByPickleId = Record<string, messages.TestCase>

export interface AssembledTestCase {
  gherkinDocument: GherkinDocument
  pickle: Pickle
  testCase: TestCase
}
