import * as messages from '@cucumber/messages'
import { Envelope } from '@cucumber/messages'
import { IRuntimeOptions } from '../index'
import { ISupportCodeCoordinates } from '../../api'

// Messages from Coordinator to Worker

export interface IWorkerCommand {
  initialize?: IWorkerCommandInitialize
  run?: IWorkerCommandRun
  finalize?: boolean
}

export interface IWorkerCommandInitialize {
  supportCodeCoordinates: ISupportCodeCoordinates
  supportCodeIds?: ICanonicalSupportCodeIds
  options: IRuntimeOptions
}

export interface ICanonicalSupportCodeIds {
  stepDefinitionIds: string[]
  beforeTestCaseHookDefinitionIds: string[]
  afterTestCaseHookDefinitionIds: string[]
}

export interface IWorkerCommandRun {
  retries: number
  skip: boolean
  elapsed: messages.Duration
  pickle: messages.Pickle
  testCase: messages.TestCase
  gherkinDocument: messages.GherkinDocument
}

// Messages from Worker to Coordinator

export interface ICoordinatorReport {
  jsonEnvelope?: Envelope
  ready?: boolean
}
