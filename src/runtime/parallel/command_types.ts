import { messages } from 'cucumber-messages'

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
  worldParameters: any
}

export interface ISlaveCommandRun {
  retries: number
  skip: boolean
  pickle: messages.IPickle
  gherkinDocument: messages.IGherkinDocument
}

// Messages from Slave to Master

export interface IMasterReport {
  encodedEnvelope?: Uint8Array
  ready?: boolean
  supportCodeIds?: IMasterReportSupportCodeIds
}

export interface IMasterReportSupportCodeIds {
  stepDefinitionIds: string[]
  beforeTestCaseHookDefinitionIds: string[]
  afterTestCaseHookDefinitionIds: string[]
}
