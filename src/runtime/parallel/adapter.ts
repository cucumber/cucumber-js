import type { EventEmitter } from 'node:events'
import path from 'node:path'
import { MessageChannel, Worker as WorkerThread } from 'node:worker_threads'
import type { IdGenerator } from '@cucumber/messages'
import type { IRunOptionsRuntime } from '../../api'
import type { AssembledTestCase } from '../../assemble'
import type { ILogger, IRunEnvironment } from '../../environment'
import type { FormatOptions } from '../../formatter'
import type StepDefinitionSnippetBuilder from '../../formatter/step_definition_snippet_builder'
import { HookTarget, type SupportCodeLibrary } from '../../support_code_library_builder/types'
import { Executor } from '../executor'
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
  private allWorkersReadiness?: {
    resolve: () => void
    reject: (reason: unknown) => void
  }
  private allBeforeAllHooksReadiness?: {
    resolve: (success: boolean) => void
    reject: (reason: unknown) => void
  }
  private staggeredBeforeAllHooks?: {
    resolve: (success: boolean) => void
    reject: (reason: unknown) => void
    settled: boolean
  }
  private staggeredBeforeAllHooksSuccess = true
  private pendingStaggeredWorkerStarts = 0
  private staggeredWorkerStartupTimer?: NodeJS.Timeout
  private phase?: Phase
  private tearingDown = false
  private readonly workers: Set<ManagedWorker> = new Set()
  private readonly running: Map<ManagedWorker, WorkerCommand> = new Map()
  private readonly executor: Executor

  constructor(
    private readonly testRunStartedId: string,
    private readonly environment: IRunEnvironment,
    private readonly logger: ILogger,
    private readonly eventBroadcaster: EventEmitter,
    newId: IdGenerator.NewId,
    private readonly options: IRunOptionsRuntime,
    private readonly snippetOptions: Pick<FormatOptions, 'snippetInterface' | 'snippetSyntax'>,
    private readonly supportCodeLibrary: SupportCodeLibrary,
    snippetBuilder: StepDefinitionSnippetBuilder
  ) {
    this.executor = new Executor(
      testRunStartedId,
      undefined,
      eventBroadcaster,
      newId,
      options,
      supportCodeLibrary,
      snippetBuilder
    )
  }

  async setup(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.readiness = { resolve, reject }
      if (this.isStaggeredStartup()) {
        const initialWorkerCount = Math.min(
          this.options.parallelRampSize ?? 1,
          this.options.parallel
        )
        for (let i = 0; i < initialWorkerCount; i++) {
          this.startWorker()
        }
      } else {
        while (this.workers.size < this.options.parallel) {
          this.startWorker()
        }
      }
    })
    delete this.readiness
  }

  async runBeforeAllHooks(): Promise<boolean> {
    const coordinatorSuccess = await this.executor.runBeforeAllHooks(
      (hook) => hook.on === HookTarget.COORDINATOR
    )
    if (this.isStaggeredStartup()) {
      const workersSuccess = await new Promise<boolean>((resolve, reject) => {
        this.staggeredBeforeAllHooks = { resolve, reject, settled: false }
        for (const worker of this.workers) {
          this.startBeforeAllHooksForWorker(worker)
        }
      })
      return coordinatorSuccess && workersSuccess
    }
    const workersSuccess = await new Promise<boolean>((resolve, reject) => {
      this.phase = new TestRunHooksPhase(resolve, reject, 'BEFOREALL_HOOKS')
      this.startPhase()
    })
    delete this.phase
    return coordinatorSuccess && workersSuccess
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
    if (this.isStaggeredStartup()) {
      await this.waitForAllWorkers()
      const beforeAllHooksSuccess = await this.waitForAllBeforeAllHooks()
      const workersSuccess = await new Promise<boolean>((resolve, reject) => {
        this.phase = new TestRunHooksPhase(resolve, reject, 'AFTERALL_HOOKS')
        this.startPhase()
      })
      delete this.phase
      const coordinatorSuccess = await this.executor.runAfterAllHooks(
        (hook) => hook.on === HookTarget.COORDINATOR
      )
      return beforeAllHooksSuccess && workersSuccess && coordinatorSuccess
    }
    const workersSuccess = await new Promise<boolean>((resolve, reject) => {
      this.phase = new TestRunHooksPhase(resolve, reject, 'AFTERALL_HOOKS')
      this.startPhase()
    })
    delete this.phase
    const coordinatorSuccess = await this.executor.runAfterAllHooks(
      (hook) => hook.on === HookTarget.COORDINATOR
    )
    return coordinatorSuccess && workersSuccess
  }

  async teardown(): Promise<void> {
    this.tearingDown = true
    if (this.staggeredWorkerStartupTimer !== undefined) {
      clearTimeout(this.staggeredWorkerStartupTimer)
    }
    for (const worker of this.workers.values()) {
      await worker.workerThread.terminate()
      // close our end of the channel so it stops keeping the loop alive
      worker.port.close()
    }
  }

  private startPhase() {
    for (const worker of this.workers) {
      if (this.isStaggeredStartup() && !worker.beforeAllHooksFinished) {
        continue
      }
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
        if (this.isStaggeredStartup()) {
          this.readiness?.resolve()
          this.queueStaggeredWorkerStart()
          this.startBeforeAllHooksForWorker(worker)
        } else if ([...this.workers].every((mw) => mw.ready)) {
          this.readiness?.resolve()
        }
        this.resolveAllWorkersReadinessIfReady()
        break
      case 'ENVELOPE':
        this.eventBroadcaster.emit('envelope', event.envelope)
        break
      case 'FINISHED': {
        const previousCommand = this.running.get(worker)
        this.running.delete(worker)
        if (
          this.isStaggeredStartup() &&
          previousCommand?.type === 'BEFOREALL_HOOKS' &&
          this.staggeredBeforeAllHooks !== undefined
        ) {
          worker.beforeAllHooksFinished = true
          if (!event.success) {
            this.staggeredBeforeAllHooksSuccess = false
          }
          if (!this.staggeredBeforeAllHooks.settled) {
            this.staggeredBeforeAllHooks.settled = true
            this.staggeredBeforeAllHooks.resolve(event.success)
          }
          this.resolveAllBeforeAllHooksReadinessIfReady()
          const nextCommand = this.phase?.fill()
          if (nextCommand) {
            this.issueCommandToWorker(worker, nextCommand)
          }
          break
        }
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
    this.allWorkersReadiness?.reject(reason)
    this.allBeforeAllHooksReadiness?.reject(reason)
    this.staggeredBeforeAllHooks?.reject(reason)
    this.phase?.reject(reason)
    void this.teardown()
  }

  private isStaggeredStartup(): boolean {
    return this.options.parallelStartupMode === 'staggered'
  }

  private startWorker() {
    if (this.workers.size >= this.options.parallel) {
      return
    }
    const id = this.workers.size.toString()
    // spin up a dedicated message channel for coordinator-worker comms
    const { port1, port2 } = new MessageChannel()
    const workerThread = new WorkerThread(path.resolve(__dirname, 'worker.mjs'), {
      env: {
        ...this.environment.env,
        CUCUMBER_PARALLEL: 'true',
        CUCUMBER_TOTAL_WORKERS: this.options.parallel.toString(),
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
          afterTestCaseHookDefinitionIds: this.supportCodeLibrary.afterTestCaseHookDefinitions.map(
            (h) => h.id
          ),
          beforeTestRunHookDefinitionIds: this.supportCodeLibrary.beforeTestRunHookDefinitions.map(
            (h) => h.id
          ),
          afterTestRunHookDefinitionIds: this.supportCodeLibrary.afterTestRunHookDefinitions.map(
            (h) => h.id
          ),
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
      beforeAllHooksFinished: false,
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

  private startBeforeAllHooksForWorker(worker: ManagedWorker) {
    if (
      !this.isStaggeredStartup() ||
      this.staggeredBeforeAllHooks === undefined ||
      !worker.ready ||
      worker.beforeAllHooksFinished ||
      this.running.has(worker)
    ) {
      return
    }
    this.issueCommandToWorker(worker, { type: 'BEFOREALL_HOOKS' })
  }

  private queueStaggeredWorkerStart() {
    if (this.workers.size + this.pendingStaggeredWorkerStarts >= this.options.parallel) {
      return
    }
    this.pendingStaggeredWorkerStarts++
    this.startQueuedStaggeredWorker()
  }

  private startQueuedStaggeredWorker() {
    if (this.pendingStaggeredWorkerStarts === 0 || this.staggeredWorkerStartupTimer !== undefined) {
      return
    }
    const start = () => {
      this.staggeredWorkerStartupTimer = undefined
      this.pendingStaggeredWorkerStarts--
      this.startWorker()
      this.startQueuedStaggeredWorker()
    }
    if ((this.options.parallelRampDelay ?? 0) === 0) {
      start()
    } else {
      this.staggeredWorkerStartupTimer = setTimeout(start, this.options.parallelRampDelay)
    }
  }

  private async waitForAllWorkers(): Promise<void> {
    if (this.allWorkersAreReady()) {
      return
    }
    await new Promise<void>((resolve, reject) => {
      this.allWorkersReadiness = { resolve, reject }
      this.resolveAllWorkersReadinessIfReady()
    })
    delete this.allWorkersReadiness
  }

  private async waitForAllBeforeAllHooks(): Promise<boolean> {
    if (this.allBeforeAllHooksAreFinished()) {
      return this.staggeredBeforeAllHooksSuccess
    }
    const success = await new Promise<boolean>((resolve, reject) => {
      this.allBeforeAllHooksReadiness = { resolve, reject }
      this.resolveAllBeforeAllHooksReadinessIfReady()
    })
    delete this.allBeforeAllHooksReadiness
    return success
  }

  private allWorkersAreReady(): boolean {
    return (
      this.workers.size === this.options.parallel &&
      [...this.workers].every((worker) => worker.ready)
    )
  }

  private allBeforeAllHooksAreFinished(): boolean {
    return (
      this.allWorkersAreReady() &&
      [...this.workers].every((worker) => worker.beforeAllHooksFinished)
    )
  }

  private resolveAllWorkersReadinessIfReady() {
    if (this.allWorkersAreReady()) {
      this.allWorkersReadiness?.resolve()
    }
  }

  private resolveAllBeforeAllHooksReadinessIfReady() {
    if (this.allBeforeAllHooksAreFinished()) {
      this.allBeforeAllHooksReadiness?.resolve(this.staggeredBeforeAllHooksSuccess)
    }
  }
}
