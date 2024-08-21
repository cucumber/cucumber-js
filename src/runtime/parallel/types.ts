import { Envelope } from '@cucumber/messages'
import { RuntimeOptions } from '../index'
import { ISupportCodeCoordinates } from '../../api'
import { AssembledTestCase } from '../../assemble'

// Messages from Coordinator to Worker

export interface CoordinatorToWorkerCommand {
  initialize?: InitializeCommand
  run?: AssembledTestCase
  finalize?: boolean
}

export interface InitializeCommand {
  supportCodeCoordinates: ISupportCodeCoordinates
  supportCodeIds?: CanonicalSupportCodeIds
  options: RuntimeOptions
}

export interface CanonicalSupportCodeIds {
  stepDefinitionIds: string[]
  beforeTestCaseHookDefinitionIds: string[]
  afterTestCaseHookDefinitionIds: string[]
}

// Messages from Worker to Coordinator

export interface WorkerToCoordinatorEvent {
  envelope?: Envelope
  ready?: boolean
}
