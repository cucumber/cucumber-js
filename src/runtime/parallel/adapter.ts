import { ChildProcess, fork } from 'node:child_process'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { AssembledTestCase } from '../../assemble'
import { ILogger, IRunEnvironment } from '../../environment'
import { RuntimeAdapter } from '../types'
import { IRunOptionsRuntime } from '../../api'
import {
  FinalizeCommand,
  InitializeCommand,
  RunCommand,
  WorkerToCoordinatorEvent,
} from './types'

const runWorkerPath = path.resolve(__dirname, 'run_worker.js')

const enum WorkerState {
  'idle',
  'closed',
  'running',
  'new',
}

interface ManagedWorker {
  state: WorkerState
  process: ChildProcess
  id: string
}

interface WorkPlacement {
  index: number
  item: AssembledTestCase
}

export class ChildProcessAdapter implements RuntimeAdapter {
  private idleInterventions: number = 0
  private failing: boolean = false
  private onFinish: (success: boolean) => void
  private todo: Array<AssembledTestCase> = []
  private readonly inProgress: Record<string, AssembledTestCase> = {}
  private readonly workers: Record<string, ManagedWorker> = {}

  constructor(
    private readonly environment: IRunEnvironment,
    private readonly logger: ILogger,
    private readonly eventBroadcaster: EventEmitter,
    private readonly options: IRunOptionsRuntime,
    private readonly supportCodeLibrary: SupportCodeLibrary
  ) {}

  parseWorkerMessage(
    worker: ManagedWorker,
    message: WorkerToCoordinatorEvent
  ): void {
    switch (message.type) {
      case 'READY':
        worker.state = WorkerState.idle
        this.awakenWorkers(worker)
        break
      case 'ENVELOPE':
        this.eventBroadcaster.emit('envelope', message.envelope)
        break
      case 'FINISHED':
        if (!message.success) {
          this.failing = true
        }
        delete this.inProgress[worker.id]
        worker.state = WorkerState.idle
        this.awakenWorkers(worker)
        break
      default:
        throw new Error(
          `Unexpected message from worker: ${JSON.stringify(message)}`
        )
    }
  }

  awakenWorkers(triggeringWorker: ManagedWorker): void {
    Object.values(this.workers).forEach((worker) => {
      if (worker.state === WorkerState.idle) {
        this.giveWork(worker)
      }
      return worker.state !== WorkerState.idle
    })

    if (Object.keys(this.inProgress).length == 0 && this.todo.length > 0) {
      this.giveWork(triggeringWorker, true)
      this.idleInterventions++
    }
  }

  startWorker(id: string, total: number): void {
    const workerProcess = fork(runWorkerPath, [], {
      cwd: this.environment.cwd,
      env: {
        ...this.environment.env,
        CUCUMBER_PARALLEL: 'true',
        CUCUMBER_TOTAL_WORKERS: total.toString(),
        CUCUMBER_WORKER_ID: id,
      },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    })
    const worker = { state: WorkerState.new, process: workerProcess, id }
    this.workers[id] = worker
    worker.process.on('message', (message: WorkerToCoordinatorEvent) => {
      this.parseWorkerMessage(worker, message)
    })
    worker.process.on('close', (exitCode) => {
      worker.state = WorkerState.closed
      this.onWorkerProcessClose(exitCode)
    })
    worker.process.send({
      type: 'INITIALIZE',
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
          this.supportCodeLibrary.afterTestCaseHookDefinitions.map((h) => h.id),
        beforeTestRunHookDefinitionIds:
          this.supportCodeLibrary.beforeTestRunHookDefinitions.map((h) => h.id),
        afterTestRunHookDefinitionIds:
          this.supportCodeLibrary.afterTestRunHookDefinitions.map((h) => h.id),
      },
      options: this.options,
    } satisfies InitializeCommand)
  }

  onWorkerProcessClose(exitCode: number): void {
    if (exitCode !== 0) {
      this.failing = true
    }

    if (
      Object.values(this.workers).every((x) => x.state === WorkerState.closed)
    ) {
      this.onFinish(!this.failing)
    }
  }

  async run(
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ): Promise<boolean> {
    this.todo = Array.from(assembledTestCases)
    return await new Promise<boolean>((resolve) => {
      for (let i = 0; i < this.options.parallel; i++) {
        this.startWorker(i.toString(), this.options.parallel)
      }
      this.onFinish = (status) => {
        if (this.idleInterventions > 0) {
          this.logger.warn(
            `WARNING: All workers went idle ${this.idleInterventions} time(s). Consider revising handler passed to setParallelCanAssign.`
          )
        }

        resolve(status)
      }
    })
  }

  nextWorkPlacement(): WorkPlacement {
    for (let index = 0; index < this.todo.length; index++) {
      const placement = this.placementAt(index)
      if (
        this.supportCodeLibrary.parallelCanAssign(
          placement.item.pickle,
          Object.values(this.inProgress).map(({ pickle }) => pickle)
        )
      ) {
        return placement
      }
    }

    return null
  }

  placementAt(index: number): WorkPlacement {
    return {
      index,
      item: this.todo[index],
    }
  }

  giveWork(worker: ManagedWorker, force: boolean = false): void {
    if (this.todo.length < 1) {
      worker.state = WorkerState.running
      worker.process.send({ type: 'FINALIZE' } satisfies FinalizeCommand)
      return
    }

    const workPlacement = force ? this.placementAt(0) : this.nextWorkPlacement()

    if (workPlacement === null) {
      return
    }

    const { index: nextIndex, item } = workPlacement

    this.todo.splice(nextIndex, 1)
    this.inProgress[worker.id] = item
    worker.state = WorkerState.running
    worker.process.send({
      type: 'RUN',
      assembledTestCase: item,
      failing: this.failing,
    } satisfies RunCommand)
  }
}
