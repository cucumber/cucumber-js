import { messages } from '@cucumber/messages'
import { IRuntimeOptions } from '../index'

// Messages from Master to Slave

export interface ISlaveCommand {
  initialize?: ISlaveCommandInitialize
  run?: ISlaveCommandRun
  finalize?: boolean
}

export interface ISlaveCommandInitialize {
  filterStacktraces: boolean
  supportCodePaths: string[]
  supportCodeRequiredModules: string[]
  options: IRuntimeOptions
}

export interface ISlaveCommandRun {
  retries: number
  skip: boolean
  pickle: messages.IPickle
  gherkinDocument: messages.IGherkinDocument
}

// Messages from Slave to Master

export interface IMasterReport {
  jsonEnvelope?: string
  ready?: boolean
  supportCodeIds?: IMasterReportSupportCodeIds
}

export interface IMasterReportSupportCodeIds {
  stepDefinitionIds: string[]
  beforeTestCaseHookDefinitionIds: string[]
  afterTestCaseHookDefinitionIds: string[]
}
