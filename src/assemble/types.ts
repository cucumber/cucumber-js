import { GherkinDocument, Pickle, TestCase } from '@cucumber/messages'

export interface SourcedPickle {
  gherkinDocument: GherkinDocument
  pickle: Pickle
}

export interface AssembledTestCase {
  gherkinDocument: GherkinDocument
  pickle: Pickle
  testCase: TestCase
}
