import { ChildProcess, fork } from 'node:child_process'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import * as messages from '@cucumber/messages'
import { shouldCauseFailure } from '../helpers'
import { EventDataCollector } from '../../formatter/helpers'
import { IRuntimeOptions } from '..'
import { SupportCodeLibrary } from '../../support_code_library_builder/types'
import { doesHaveValue } from '../../value_checker'
import { AssembledTestCase } from '../../assemble'
import { ILogger } from '../../logger'
import { CoordinatorAdapter } from '../types'
import { ICoordinatorReport, IWorkerCommand } from './command_types'

const runWorkerPath = path.resolve(__dirname, 'run_worker.js')

export interface INewCoordinatorOptions {
  cwd: string
  logger: ILogger
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  options: IRuntimeOptions
  supportCodeLibrary: SupportCodeLibrary
  numberOfWorkers: number
}

const enum WorkerState {
  'idle',
  'closed',
  'running',
  'new',
}

interface IWorker {
  state: WorkerState
  process: ChildProcess
  id: string
}

interface WorkPlacement {
  index: number
  item: AssembledTestCase
}

export class ChildProcessCoordinatorAdapter implements CoordinatorAdapter {
  private readonly cwd: string
  private readonly eventBroadcaster: EventEmitter
  private readonly eventDataCollector: EventDataCollector
  private onFinish: (success: boolean) => void
  private readonly options: IRuntimeOptions
  private todo: Array<AssembledTestCase>
  private readonly inProgress: Record<string, AssembledTestCase>
  private readonly workers: Record<string, IWorker>
  private readonly supportCodeLibrary: SupportCodeLibrary
  private readonly numberOfWorkers: number
  private readonly logger: ILogger
  private success: boolean
  private idleInterventions: number

  constructor({
    cwd,
    logger,
    eventBroadcaster,
    eventDataCollector,
    options,
    supportCodeLibrary,
    numberOfWorkers,
  }: INewCoordinatorOptions) {
    this.cwd = cwd
    this.logger = logger
    this.eventBroadcaster = eventBroadcaster
    this.eventDataCollector = eventDataCollector
    this.options = options
    this.supportCodeLibrary = supportCodeLibrary
    this.numberOfWorkers = numberOfWorkers
    this.success = true
    this.workers = {}
    this.inProgress = {}
    this.idleInterventions = 0
  }

  parseWorkerMessage(worker: IWorker, message: ICoordinatorReport): void {
    if (message.ready) {
      worker.state = WorkerState.idle
      this.awakenWorkers(worker)
    } else if (doesHaveValue(message.jsonEnvelope)) {
      const envelope = message.jsonEnvelope
      this.eventBroadcaster.emit('envelope', envelope)
      if (doesHaveValue(envelope.testCaseFinished)) {
        this.parseTestCaseResult(envelope.testCaseFinished, worker.id)
      }
    } else {
      throw new Error(
        `Unexpected message from worker: ${JSON.stringify(message)}`
      )
    }
  }

  awakenWorkers(triggeringWorker: IWorker): void {
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
      cwd: this.cwd,
      env: {
        ...process.env,
        CUCUMBER_PARALLEL: 'true',
        CUCUMBER_TOTAL_WORKERS: total.toString(),
        CUCUMBER_WORKER_ID: id,
      },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    })
    const worker = { state: WorkerState.new, process: workerProcess, id }
    this.workers[id] = worker
    worker.process.on('message', (message: ICoordinatorReport) => {
      this.parseWorkerMessage(worker, message)
    })
    worker.process.on('close', (exitCode) => {
      worker.state = WorkerState.closed
      this.onWorkerProcessClose(exitCode)
    })
    const initializeCommand: IWorkerCommand = {
      initialize: {
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
        },
        options: this.options,
      },
    }
    worker.process.send(initializeCommand)
  }

  onWorkerProcessClose(exitCode: number): void {
    const success = exitCode === 0
    if (!success) {
      this.success = false
    }

    if (
      Object.values(this.workers).every((x) => x.state === WorkerState.closed)
    ) {
      this.onFinish(this.success)
    }
  }

  parseTestCaseResult(
    testCaseFinished: messages.TestCaseFinished,
    workerId: string
  ): void {
    const { worstTestStepResult } = this.eventDataCollector.getTestCaseAttempt(
      testCaseFinished.testCaseStartedId
    )
    if (!testCaseFinished.willBeRetried) {
      delete this.inProgress[workerId]

      if (shouldCauseFailure(worstTestStepResult.status, this.options)) {
        this.success = false
      }
    }
  }

  async start(
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ): Promise<boolean> {
    this.todo = Array.from(assembledTestCases)
    return await new Promise<boolean>((resolve) => {
      for (let i = 0; i < this.numberOfWorkers; i++) {
        this.startWorker(i.toString(), this.numberOfWorkers)
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

  giveWork(worker: IWorker, force: boolean = false): void {
    if (this.todo.length < 1) {
      const finalizeCommand: IWorkerCommand = { finalize: true }
      worker.state = WorkerState.running
      worker.process.send(finalizeCommand)
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
      run: item,
    })
  }
}
