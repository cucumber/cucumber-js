import { ChildProcess, fork } from 'child_process'
import path from 'path'
import { retriesForPickle, shouldCauseFailure } from '../helpers'
import * as messages from '@cucumber/messages'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../../formatter/helpers'
import { IRuntime, IRuntimeOptions } from '..'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import { ICoordinatorReport, IWorkerCommand } from './command_types'
import { doesHaveValue } from '../../value_checker'
import { ITestRunStopwatch, RealTestRunStopwatch } from '../stopwatch'
import { assembleTestCases, IAssembledTestCases } from '../assemble_test_cases'
import { IdGenerator } from '@cucumber/messages'

const runWorkerPath = path.resolve(__dirname, 'run_worker.js')

export interface INewCoordinatorOptions {
  cwd: string
  logger: Console
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  options: IRuntimeOptions
  newId: IdGenerator.NewId
  pickleIds: string[]
  supportCodeLibrary: ISupportCodeLibrary
  requireModules: string[]
  requirePaths: string[]
  importPaths: string[]
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

interface IPicklePlacement {
  index: number
  pickle: messages.Pickle
}

export default class Coordinator implements IRuntime {
  private readonly cwd: string
  private readonly eventBroadcaster: EventEmitter
  private readonly eventDataCollector: EventDataCollector
  private readonly stopwatch: ITestRunStopwatch
  private onFinish: (success: boolean) => void
  private readonly options: IRuntimeOptions
  private readonly newId: IdGenerator.NewId
  private readonly pickleIds: string[]
  private assembledTestCases: IAssembledTestCases
  private inProgressPickles: Record<string, messages.Pickle>
  private workers: Record<string, IWorker>
  private readonly supportCodeLibrary: ISupportCodeLibrary
  private readonly requireModules: string[]
  private readonly requirePaths: string[]
  private readonly importPaths: string[]
  private readonly numberOfWorkers: number
  private readonly logger: Console
  private success: boolean
  private idleInterventions: number

  constructor({
    cwd,
    logger,
    eventBroadcaster,
    eventDataCollector,
    pickleIds,
    options,
    newId,
    supportCodeLibrary,
    requireModules,
    requirePaths,
    importPaths,
    numberOfWorkers,
  }: INewCoordinatorOptions) {
    this.cwd = cwd
    this.logger = logger
    this.eventBroadcaster = eventBroadcaster
    this.eventDataCollector = eventDataCollector
    this.stopwatch = new RealTestRunStopwatch()
    this.options = options
    this.newId = newId
    this.supportCodeLibrary = supportCodeLibrary
    this.requireModules = requireModules
    this.requirePaths = requirePaths
    this.importPaths = importPaths
    this.pickleIds = Array.from(pickleIds)
    this.numberOfWorkers = numberOfWorkers
    this.success = true
    this.workers = {}
    this.inProgressPickles = {}
    this.idleInterventions = 0
  }

  parseWorkerMessage(worker: IWorker, message: ICoordinatorReport): void {
    if (message.ready) {
      worker.state = WorkerState.idle
      this.awakenWorkers(worker)
    } else if (doesHaveValue(message.jsonEnvelope)) {
      const envelope = messages.parseEnvelope(message.jsonEnvelope)
      this.eventBroadcaster.emit('envelope', envelope)
      if (doesHaveValue(envelope.testCaseFinished)) {
        delete this.inProgressPickles[worker.id]
        this.parseTestCaseResult(envelope.testCaseFinished)
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

    if (
      Object.keys(this.inProgressPickles).length == 0 &&
      this.pickleIds.length > 0
    ) {
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
        filterStacktraces: this.options.filterStacktraces,
        requireModules: this.requireModules,
        requirePaths: this.requirePaths,
        importPaths: this.importPaths,
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
      const envelope: messages.Envelope = {
        testRunFinished: {
          timestamp: this.stopwatch.timestamp(),
          success,
        },
      }
      this.eventBroadcaster.emit('envelope', envelope)
      this.onFinish(this.success)
    }
  }

  parseTestCaseResult(testCaseFinished: messages.TestCaseFinished): void {
    const { worstTestStepResult } = this.eventDataCollector.getTestCaseAttempt(
      testCaseFinished.testCaseStartedId
    )
    if (
      !testCaseFinished.willBeRetried &&
      shouldCauseFailure(worstTestStepResult.status, this.options)
    ) {
      this.success = false
    }
  }

  async start(): Promise<boolean> {
    const envelope: messages.Envelope = {
      testRunStarted: {
        timestamp: this.stopwatch.timestamp(),
      },
    }
    this.eventBroadcaster.emit('envelope', envelope)
    this.stopwatch.start()
    this.assembledTestCases = await assembleTestCases({
      eventBroadcaster: this.eventBroadcaster,
      newId: this.newId,
      pickles: this.pickleIds.map((pickleId) =>
        this.eventDataCollector.getPickle(pickleId)
      ),
      supportCodeLibrary: this.supportCodeLibrary,
    })
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

  nextPicklePlacement(): IPicklePlacement {
    for (let index = 0; index < this.pickleIds.length; index++) {
      const placement = this.placementAt(index)
      if (
        this.supportCodeLibrary.parallelCanAssign(
          placement.pickle,
          Object.values(this.inProgressPickles)
        )
      ) {
        return placement
      }
    }

    return null
  }

  placementAt(index: number): IPicklePlacement {
    return {
      index,
      pickle: this.eventDataCollector.getPickle(this.pickleIds[index]),
    }
  }

  giveWork(worker: IWorker, force: boolean = false): void {
    if (this.pickleIds.length < 1) {
      const finalizeCommand: IWorkerCommand = { finalize: true }
      worker.state = WorkerState.running
      worker.process.send(finalizeCommand)
      return
    }

    const picklePlacement = force
      ? this.placementAt(0)
      : this.nextPicklePlacement()

    if (picklePlacement === null) {
      return
    }

    const { index: nextPickleIndex, pickle } = picklePlacement

    this.pickleIds.splice(nextPickleIndex, 1)
    this.inProgressPickles[worker.id] = pickle
    const testCase = this.assembledTestCases[pickle.id]
    const gherkinDocument = this.eventDataCollector.getGherkinDocument(
      pickle.uri
    )
    const retries = retriesForPickle(pickle, this.options)
    const skip = this.options.dryRun || (this.options.failFast && !this.success)
    const runCommand: IWorkerCommand = {
      run: {
        retries,
        skip,
        elapsed: this.stopwatch.duration().nanos(),
        pickle,
        testCase,
        gherkinDocument,
      },
    }
    worker.state = WorkerState.running
    worker.process.send(runCommand)
  }
}
