import * as messages from '@cucumber/messages'
import { IRuntimeOptions } from '../index'

// Messages from Coordinator to Worker

export interface IWorkerCommand {
  initialize?: IWorkerCommandInitialize
  run?: IWorkerCommandRun
  finalize?: boolean
}

export interface IWorkerCommandInitialize {
  filterStacktraces: boolean
  supportCodePaths: string[]
  supportCodeRequiredModules: string[]
  options: IRuntimeOptions
}

export interface IWorkerCommandRun {
  retries: number
  skip: boolean
  elapsed: number
  pickle: messages.Pickle
  gherkinDocument: messages.GherkinDocument
}

// Messages from Worker to Coordinator

export interface ICoordinatorReport {
  jsonEnvelope?: string
  ready?: boolean
  supportCodeIds?: ICoordinatorReportSupportCodeIds
}

export interface ICoordinatorReportSupportCodeIds {
  stepDefinitionIds: string[]
  beforeTestCaseHookDefinitionIds: string[]
  afterTestCaseHookDefinitionIds: string[]
}
