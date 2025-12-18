import { Envelope } from '@cucumber/messages'
import { ISupportCodeCoordinates } from '../../../api'
import { CanonicalSupportCodeIds } from '../../../support_code_library_builder/types'
import { RuntimeOptions } from '../../types'
import { FormatOptions } from '../../../formatter'
import { AssembledTestCase } from '../../../assemble'

export type WorkerData = {
  cwd: string
  testRunStartedId: string
  supportCodeCoordinates: ISupportCodeCoordinates
  supportCodeIds: CanonicalSupportCodeIds
  options: RuntimeOptions
  snippetOptions: Pick<FormatOptions, 'snippetInterface' | 'snippetSyntax'>
}

export type RunTestCaseCommand = {
  type: 'TEST_CASE'
  assembledTestCase: AssembledTestCase
  failing: boolean
}

export type WorkerCommand = RunTestCaseCommand

export type ReadyEvent = {
  type: 'READY'
}

export type MessageEvent = {
  type: 'ENVELOPE'
  envelope: Envelope
}

export type FinishedEvent = {
  type: 'FINISHED'
}

export type WorkerEvent = ReadyEvent | MessageEvent | FinishedEvent