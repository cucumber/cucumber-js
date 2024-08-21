import { Envelope } from '@cucumber/messages'
import { RuntimeOptions } from '../index'
import { ISupportCodeCoordinates } from '../../api'
import { AssembledTestCase } from '../../assemble'

// Messages from Coordinator to Worker

export interface IWorkerCommand {
  initialize?: IWorkerCommandInitialize
  run?: AssembledTestCase
  finalize?: boolean
}

export interface IWorkerCommandInitialize {
  supportCodeCoordinates: ISupportCodeCoordinates
  supportCodeIds?: ICanonicalSupportCodeIds
  options: RuntimeOptions
}

export interface ICanonicalSupportCodeIds {
  stepDefinitionIds: string[]
  beforeTestCaseHookDefinitionIds: string[]
  afterTestCaseHookDefinitionIds: string[]
}

// Messages from Worker to Coordinator

export interface ICoordinatorReport {
  jsonEnvelope?: Envelope
  ready?: boolean
}
