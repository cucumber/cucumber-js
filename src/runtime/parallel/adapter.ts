import { EventEmitter } from 'node:events'
import { Worker } from 'node:worker_threads'
import path from 'node:path'
import { setInterval } from 'node:timers/promises'
import { Pickle } from '@cucumber/messages'
import { RuntimeAdapter } from '../types'
import { AssembledTestCase } from '../../assemble'
import { ILogger, IRunEnvironment } from '../../environment'
import { IRunOptionsRuntime } from '../../api'
import { FormatOptions } from '../../formatter'
import {
  ParallelAssignmentValidator,
  SupportCodeLibrary,
} from '../../support_code_library_builder/types'
import {
  FinishedEvent,
  RunTestCaseCommand,
  WorkerCommand,
  WorkerData,
  WorkerEvent,
} from './types'

type ManagedWorker = {
  id: string
  workerThread: Worker
  ready: boolean
}

interface Phase<T extends WorkerCommand> {
  fill: () => T | undefined
  next: (command: T, event: FinishedEvent) => WorkerCommand | undefined
}

class TestRunHooksPhase implements Phase<WorkerCommand> {
  private failing = false
  private waiting = 0

  constructor(
    private readonly resolve: (success: boolean) => void,
    private readonly reject: (reason: unknown) => void,
    private readonly type: 'BEFOREALL_HOOKS' | 'AFTERALL_HOOKS'
  ) {}

  fill(): WorkerCommand | undefined {
    this.waiting++
    return {
      type: this.type,
    }
  }

  next(
    command: WorkerCommand,
    event: FinishedEvent
  ): WorkerCommand | undefined {
    if (!event.success) {
      this.failing = true
    }
    this.waiting--
    if (this.waiting === 0) {
      this.resolve(!this.failing)
    }
    return undefined
  }
}

class TestCasesPhase implements Phase<RunTestCaseCommand> {
  private failing = false
  private idleInterventions = 0
  private readonly queue: Array<AssembledTestCase> = []
  private readonly running: Set<Pickle> = new Set()

  constructor(
    private readonly resolve: (success: boolean) => void,
    private readonly reject: (reason: unknown) => void,
    private readonly logger: ILogger,
    private readonly canAssign: ParallelAssignmentValidator,
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ) {
    this.queue.push(...assembledTestCases)
  }

  fill(): RunTestCaseCommand | undefined {
    return this.select()
  }

  next(
    command: RunTestCaseCommand,
    event: FinishedEvent
  ): RunTestCaseCommand | undefined {
    if (!event.success) {
      this.failing = true
    }
    this.running.delete(command.assembledTestCase.pickle)
    if (this.queue.length === 0 && this.running.size === 0) {
      if (this.idleInterventions > 0) {
        this.logger.warn(
          `WARNING: All workers went idle ${this.idleInterventions} time(s). Consider revising handler passed to setParallelCanAssign.`
        )
      }
      this.resolve(!this.failing)
      return undefined
    }
    return this.select()
  }

  private select(): RunTestCaseCommand {
    if (this.queue.length === 0) {
      return undefined
    }
    for (const assembledTestCase of this.queue) {
      if (this.canAssign(assembledTestCase.pickle, [...this.running])) {
        return this.dequeue(assembledTestCase)
      }
    }
    if (this.running.size === 0) {
      this.idleInterventions++
      return this.dequeue(this.queue.at(0))
    }
    return undefined
  }

  private dequeue(assembledTestCase: AssembledTestCase): RunTestCaseCommand {
    this.queue.splice(this.queue.indexOf(assembledTestCase), 1)
    this.running.add(assembledTestCase.pickle)
    return {
      type: 'TEST_CASE',
      assembledTestCase,
      failing: this.failing,
    }
  }
}

export class WorkerThreadsAdapter implements RuntimeAdapter {
  private phase: Phase<WorkerCommand>
  private readonly workers: Set<ManagedWorker> = new Set()
  private readonly running: Map<ManagedWorker, WorkerCommand> = new Map()

  constructor(
    private readonly testRunStartedId: string,
    private readonly environment: IRunEnvironment,
    private readonly logger: ILogger,
    private readonly eventBroadcaster: EventEmitter,
    private readonly options: IRunOptionsRuntime,
    private readonly snippetOptions: Pick<
      FormatOptions,
      'snippetInterface' | 'snippetSyntax'
    >,
    private readonly supportCodeLibrary: SupportCodeLibrary
  ) {}

  private initiatePhase(phase: Phase<WorkerCommand>) {
    this.phase = phase
    for (const worker of this.workers) {
      const command = phase.fill()
      if (command) {
        this.issueCommandToWorker(worker, command)
      }
    }
  }

  async setup() {
    const total = this.options.parallel
    for (let i = 0; i < total; i++) {
      const id = i.toString()
      const workerThread = new Worker(path.resolve(__dirname, 'worker.mjs'), {
        env: {
          ...this.environment.env,
          CUCUMBER_PARALLEL: 'true',
          CUCUMBER_TOTAL_WORKERS: total.toString(),
          CUCUMBER_WORKER_ID: id,
        },
        workerData: {
          cwd: this.environment.cwd,
          testRunStartedId: this.testRunStartedId,
          supportCodeCoordinates: this.supportCodeLibrary.originalCoordinates,
          supportCodeIds: {
            stepDefinitionIds: this.supportCodeLibrary.stepDefinitions.map(
              (s) => s.id
            ),
            beforeTestCaseHookDefinitionIds:
              this.supportCodeLibrary.beforeTestCaseHookDefinitions.map(
                (h) => h.id
              ),
            afterTestCaseHookDefinitionIds:
              this.supportCodeLibrary.afterTestCaseHookDefinitions.map(
                (h) => h.id
              ),
            beforeTestRunHookDefinitionIds:
              this.supportCodeLibrary.beforeTestRunHookDefinitions.map(
                (h) => h.id
              ),
            afterTestRunHookDefinitionIds:
              this.supportCodeLibrary.afterTestRunHookDefinitions.map(
                (h) => h.id
              ),
          },
          options: this.options,
          snippetOptions: this.snippetOptions,
        } satisfies WorkerData,
      })
      const worker = {
        id,
        workerThread,
        ready: false,
      }
      this.workers.add(worker)
      workerThread.on('message', (event: WorkerEvent) => {
        this.handleEventFromWorker(worker, event)
      })
    }
    for await (const started of setInterval(100, performance.now())) {
      if ([...this.workers].every((mw) => mw.ready)) {
        this.logger.debug(`Prepared workers in ${performance.now() - started}`)
        break
      }
    }
  }

  async teardown() {
    for (const worker of this.workers.values()) {
      await worker.workerThread.terminate()
    }
  }

  runBeforeAllHooks(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.initiatePhase(
        new TestRunHooksPhase(resolve, reject, 'BEFOREALL_HOOKS')
      )
    })
  }

  runTestCases(
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.initiatePhase(
        new TestCasesPhase(
          resolve,
          reject,
          this.logger,
          this.supportCodeLibrary.parallelCanAssign,
          assembledTestCases
        )
      )
    })
  }

  runAfterAllHooks(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.initiatePhase(
        new TestRunHooksPhase(resolve, reject, 'AFTERALL_HOOKS')
      )
    })
  }

  private issueCommandToWorker(worker: ManagedWorker, command: WorkerCommand) {
    this.running.set(worker, command)
    worker.workerThread.postMessage(command)
  }

  private handleEventFromWorker(worker: ManagedWorker, event: WorkerEvent) {
    switch (event.type) {
      case 'READY':
        worker.ready = true
        break
      case 'ENVELOPE':
        this.eventBroadcaster.emit('envelope', event.envelope)
        break
      case 'FINISHED': {
        const command = this.running.get(worker)
        this.running.delete(worker)

        const newCommand = this.phase.next(command, event)
        if (newCommand) {
          this.issueCommandToWorker(worker, newCommand)
        }
        break
      }
    }
  }
}
