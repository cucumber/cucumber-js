import type { MessagePort, Worker } from 'node:worker_threads'
import type { Envelope } from '@cucumber/messages'
import type { ISupportCodeCoordinates } from '../../api'
import type { AssembledTestCase } from '../../assemble'
import type { FormatOptions } from '../../formatter'
import type { CanonicalSupportCodeIds } from '../../support_code_library_builder/types'
import type { AttemptSpec, TestCaseAttemptResult } from '../attempt_manager'
import type { RuntimeOptions } from '../types'

export type ManagedWorker = {
  id: string
  workerThread: Worker
  port: MessagePort
  ready: boolean
}

export type WorkerData = {
  cwd: string
  testRunStartedId: string
  supportCodeCoordinates: ISupportCodeCoordinates
  supportCodeIds: CanonicalSupportCodeIds
  options: RuntimeOptions
  snippetOptions: Pick<FormatOptions, 'snippetInterface' | 'snippetSyntax'>
  port: MessagePort
}

export type RunBeforeAllHooksCommand = {
  type: 'BEFOREALL_HOOKS'
}

export type RunTestCaseAttemptCommand = AttemptSpec & {
  type: 'TEST_CASE_ATTEMPT'
  assembledTestCase: AssembledTestCase
}

export type RunAfterAllHooksCommand = {
  type: 'AFTERALL_HOOKS'
}

export type WorkerCommand =
  | RunBeforeAllHooksCommand
  | RunTestCaseAttemptCommand
  | RunAfterAllHooksCommand

export type ReadyEvent = {
  type: 'READY'
}

export type EnvelopeEvent = {
  type: 'ENVELOPE'
  envelope: Envelope
}

export type FinishedEvent = {
  type: 'FINISHED'
  success: boolean
}

export type TestCaseAttemptFinishedEvent = {
  type: 'TEST_CASE_ATTEMPT_FINISHED'
  result: TestCaseAttemptResult
}

export type WorkerResultEvent = FinishedEvent | TestCaseAttemptFinishedEvent

export type WorkerEvent = ReadyEvent | EnvelopeEvent | WorkerResultEvent

export interface Phase<
  C extends WorkerCommand = WorkerCommand,
  E extends WorkerResultEvent = WorkerResultEvent,
> {
  fill: () => C | undefined
  next: (command: C, event: E) => C | undefined
  reject: (reason: unknown) => void
}
