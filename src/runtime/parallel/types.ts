import { Envelope } from '@cucumber/messages'
import { ISupportCodeCoordinates } from '../../api'
import { CanonicalSupportCodeIds } from '../../support_code_library_builder/types'
import { RuntimeOptions } from '../types'
import { FormatOptions } from '../../formatter'
import { AssembledTestCase } from '../../assemble'

export type WorkerData = {
  cwd: string
  testRunStartedId: string
  supportCodeCoordinates: ISupportCodeCoordinates
  supportCodeIds: CanonicalSupportCodeIds
  options: RuntimeOptions
  snippetOptions: Pick<FormatOptions, 'snippetInterface' | 'snippetSyntax'>
}

export type RunBeforeAllHooksCommand = {
  type: 'BEFOREALL_HOOKS'
}

export type RunTestCaseCommand = {
  type: 'TEST_CASE'
  assembledTestCase: AssembledTestCase
  failing: boolean
}

export type RunAfterAllHooksCommand = {
  type: 'AFTERALL_HOOKS'
}

export type WorkerCommand =
  | RunBeforeAllHooksCommand
  | RunTestCaseCommand
  | RunAfterAllHooksCommand

export type ReadyEvent = {
  type: 'READY'
}

export type MessageEvent = {
  type: 'ENVELOPE'
  envelope: Envelope
}

export type FinishedEvent = {
  type: 'FINISHED'
  success: boolean
}

export type WorkerEvent = ReadyEvent | MessageEvent | FinishedEvent
