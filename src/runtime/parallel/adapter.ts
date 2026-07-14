import type { EventEmitter } from 'node:events'
import path from 'node:path'
import { MessageChannel, Worker } from 'node:worker_threads'
import type { IRunOptionsRuntime } from '../../api'
import type { AssembledTestCase } from '../../assemble'
import type { ILogger, IRunEnvironment } from '../../environment'
import type { FormatOptions } from '../../formatter'
import type { SupportCodeLibrary } from '../../support_code_library_builder/types'
import type { RuntimeAdapter } from '../types'
import { TestCasesPhase } from './test_cases_phase'
import { TestRunHooksPhase } from './test_run_hooks_phase'
import type { ManagedWorker, Phase, WorkerCommand, WorkerData, WorkerEvent } from './types'

/**
 * An adapter that distributes work across multiple worker threads
 * @remarks
 * Each phase of the test run is self-contained and self-orchestrating - every
 * FINISHED message from a worker may cause the next piece of work to be
 * triggered or the phase to be settled.
 */
export class WorkerThreadsAdapter implements RuntimeAdapter {
  private readiness?: {
    resolve: () => void
    reject: (reason: unknown) => void
  }
  private phase?: Phase
  private tearingDown = false
  private readonly workers: Set<ManagedWorker> = new Set()
  private readonly running: Map<ManagedWorker, WorkerCommand> = new Map()

  constructor(
    private readonly testRunStartedId: string,
    private readonly environment: IRunEnvironment,
    private readonly logger: ILogger,
    private readonly eventBroadcaster: EventEmitter,
    private readonly options: IRunOptionsRuntime,
    private readonly snippetOptions: Pick<FormatOptions, 'snippetInterface' | 'snippetSyntax'>,
    private readonly supportCodeLibrary: SupportCodeLibrary
  ) {}

  async setup(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.readiness = { resolve, reject }
      const total = this.options.parallel
      for (let i = 0; i < total; i++) {
        const id = i.toString()
        // spin up a dedicated message channel for coordinator-worker comms
        const { port1, port2 } = new MessageChannel()
        const workerThread = new Worker(path.resolve(__dirname, 'worker.mjs'), {
          env: {
            ...this.environment.env,
            CUCUMBER_PARALLEL: 'true',
            CUCUMBER_TOTAL_WORKERS: total.toString(),
            CUCUMBER_WORKER_ID: id,
          },
          resourceLimits: this.options.workerOptions?.resourceLimits,
          workerData: {
            cwd: this.environment.cwd,
            testRunStartedId: this.testRunStartedId,
            supportCodeCoordinates: this.supportCodeLibrary.originalCoordinates,
            supportCodeIds: {
              stepDefinitionIds: this.supportCodeLibrary.stepDefinitions.map((s) => s.id),
              beforeTestCaseHookDefinitionIds:
                this.supportCodeLibrary.beforeTestCaseHookDefinitions.map((h) => h.id),
              afterTestCaseHookDefinitionIds:
                this.supportCodeLibrary.afterTestCaseHookDefinitions.map((h) => h.id),
              beforeTestRunHookDefinitionIds:
                this.supportCodeLibrary.beforeTestRunHookDefinitions.map((h) => h.id),
              afterTestRunHookDefinitionIds:
                this.supportCodeLibrary.afterTestRunHookDefinitions.map((h) => h.id),
            },
            options: this.options,
            snippetOptions: this.snippetOptions,
            port: port2,
          } satisfies WorkerData,
          transferList: [port2],
        })
        const worker = {
          id,
          workerThread,
          port: port1,
          ready: false,
        }
        this.workers.add(worker)
        port1.on('message', (event: WorkerEvent) => {
          this.handleEventFromWorker(worker, event)
        })
        workerThread.on('error', (error) => {
          this.handleErrorFromWorker(error, worker)
        })
        workerThread.on('exit', (exitCode) => {
          this.handleExitFromWorker(exitCode, worker)
        })
      }
    })
    delete this.readiness
  }

  async runBeforeAllHooks(): Promise<boolean> {
    const success = await new Promise<boolean>((resolve, reject) => {
      this.phase = new TestRunHooksPhase(resolve, reject, 'BEFOREALL_HOOKS')
      this.startPhase()
    })
    delete this.phase
    return success
  }

  async runTestCases(assembledTestCases: ReadonlyArray<AssembledTestCase>): Promise<boolean> {
    const success = await new Promise<boolean>((resolve, reject) => {
      this.phase = new TestCasesPhase(
        resolve,
        reject,
        this.logger,
        this.supportCodeLibrary.parallelCanAssign,
        assembledTestCases
      )
      this.startPhase()
    })
    delete this.phase
    return success
  }

  async runAfterAllHooks(): Promise<boolean> {
    const success = await new Promise<boolean>((resolve, reject) => {
      this.phase = new TestRunHooksPhase(resolve, reject, 'AFTERALL_HOOKS')
      this.startPhase()
    })
    delete this.phase
    return success
  }

  async teardown(): Promise<void> {
    this.tearingDown = true
    for (const worker of this.workers.values()) {
      await worker.workerThread.terminate()
      // close our end of the channel so it stops keeping the loop alive
      worker.port.close()
    }
  }

  private startPhase() {
    for (const worker of this.workers) {
      const command = this.phase.fill()
      if (command) {
        this.issueCommandToWorker(worker, command)
      }
    }
  }

  private issueCommandToWorker(worker: ManagedWorker, command: WorkerCommand) {
    this.running.set(worker, command)
    worker.port.postMessage(command)
  }

  private handleEventFromWorker(worker: ManagedWorker, event: WorkerEvent) {
    switch (event.type) {
      case 'READY':
        worker.ready = true
        if ([...this.workers].every((mw) => mw.ready)) {
          this.readiness?.resolve()
        }
        break
      case 'ENVELOPE':
        this.eventBroadcaster.emit('envelope', event.envelope)
        break
      case 'FINISHED': {
        const previousCommand = this.running.get(worker)
        this.running.delete(worker)
        const nextCommand = this.phase?.next(previousCommand, event)
        if (nextCommand) {
          this.issueCommandToWorker(worker, nextCommand)
        }
        break
      }
    }
  }

  private handleErrorFromWorker(error: Error, worker: ManagedWorker) {
    this.fail(new Error(`Error on worker ${worker.id}`, { cause: error }))
  }

  private handleExitFromWorker(exitCode: number, worker: ManagedWorker) {
    if (!this.tearingDown) {
      this.fail(new Error(`Worker ${worker.id} exited unexpectedly with code ${exitCode}`))
    }
  }

  private fail(reason: Error) {
    this.readiness?.reject(reason)
    this.phase?.reject(reason)
    void this.teardown()
  }
}
