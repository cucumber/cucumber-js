import type { MessagePort, Worker } from 'node:worker_threads'
import type { Envelope } from '@cucumber/messages'
import type { ISupportCodeCoordinates } from '../../api'
import type { AssembledTestCase } from '../../assemble'
import type { FormatOptions } from '../../formatter'
import type { CanonicalSupportCodeIds } from '../../support_code_library_builder/types'
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

export type RunTestCaseCommand = {
  type: 'TEST_CASE'
  assembledTestCase: AssembledTestCase
  failing: boolean
}

export type RunAfterAllHooksCommand = {
  type: 'AFTERALL_HOOKS'
}

export type WorkerCommand = RunBeforeAllHooksCommand | RunTestCaseCommand | RunAfterAllHooksCommand

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

export type WorkerEvent = ReadyEvent | EnvelopeEvent | FinishedEvent

export interface Phase<T extends WorkerCommand = WorkerCommand> {
  fill: () => T | undefined
  next: (command: T, event: FinishedEvent) => T | undefined
  reject: (reason: unknown) => void
}
