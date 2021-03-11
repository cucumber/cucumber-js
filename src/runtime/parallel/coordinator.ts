import _, { Dictionary } from 'lodash'
import { ChildProcess, fork } from 'child_process'
import path from 'path'
import Status from '../../status'
import { retriesForPickle } from '../helpers'
import { messages } from '@cucumber/messages'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../../formatter/helpers'
import { IRuntimeOptions } from '..'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import {
  ICoordinatorReport,
  ICoordinatorReportSupportCodeIds,
  IWorkerCommand,
} from './command_types'
import { doesHaveValue } from '../../value_checker'
import {
  ITestRunStopwatch,
  PredictableTestRunStopwatch,
  RealTestRunStopwatch,
} from '../stopwatch'

const runWorkerPath = path.resolve(__dirname, 'run_worker.js')

export interface INewCoordinatorOptions {
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  options: IRuntimeOptions
  pickleIds: string[]
  supportCodeLibrary: ISupportCodeLibrary
  supportCodePaths: string[]
  supportCodeRequiredModules: string[]
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
  pickle: messages.IPickle
}

export default class Coordinator {
  private readonly cwd: string
  private readonly eventBroadcaster: EventEmitter
  private readonly eventDataCollector: EventDataCollector
  private readonly stopwatch: ITestRunStopwatch
  private onFinish: (success: boolean) => void
  private readonly options: IRuntimeOptions
  private readonly pickleIds: string[]
  private inProgressPickles: Dictionary<messages.IPickle>
  private workers: Dictionary<IWorker>
  private supportCodeIdMap: Dictionary<string>
  private readonly supportCodeLibrary: ISupportCodeLibrary
  private readonly supportCodePaths: string[]
  private readonly supportCodeRequiredModules: string[]
  private success: boolean
  private idleInterventions: number

  constructor({
    cwd,
    eventBroadcaster,
    eventDataCollector,
    pickleIds,
    options,
    supportCodeLibrary,
    supportCodePaths,
    supportCodeRequiredModules,
  }: INewCoordinatorOptions) {
    this.cwd = cwd
    this.eventBroadcaster = eventBroadcaster
    this.eventDataCollector = eventDataCollector
    this.stopwatch = options.predictableIds
      ? new PredictableTestRunStopwatch()
      : new RealTestRunStopwatch()
    this.options = options
    this.supportCodeLibrary = supportCodeLibrary
    this.supportCodePaths = supportCodePaths
    this.supportCodeRequiredModules = supportCodeRequiredModules
    this.pickleIds = pickleIds
    this.success = true
    this.workers = {}
    this.inProgressPickles = {}
    this.supportCodeIdMap = {}
    this.idleInterventions = 0
  }

  parseWorkerMessage(worker: IWorker, message: ICoordinatorReport): void {
    if (doesHaveValue(message.supportCodeIds)) {
      this.saveDefinitionIdMapping(message.supportCodeIds)
    } else if (message.ready) {
      worker.state = WorkerState.idle
      this.awakenWorkers(worker)
    } else if (doesHaveValue(message.jsonEnvelope)) {
      const envelope = messages.Envelope.fromObject(
        JSON.parse(message.jsonEnvelope)
      )
      this.eventBroadcaster.emit('envelope', envelope)
      if (doesHaveValue(envelope.testCase)) {
        this.remapDefinitionIds(envelope.testCase)
      }
      if (doesHaveValue(envelope.testCaseFinished)) {
        this.inProgressPickles = _.omit(this.inProgressPickles, worker.id)
        this.parseTestCaseResult(envelope.testCaseFinished)
      }
    } else {
      throw new Error(
        `Unexpected message from worker: ${JSON.stringify(message)}`
      )
    }
  }

  saveDefinitionIdMapping(message: ICoordinatorReportSupportCodeIds): void {
    _.each(message.stepDefinitionIds, (id: string, index: number) => {
      this.supportCodeIdMap[id] = this.supportCodeLibrary.stepDefinitions[
        index
      ].id
    })
    _.each(
      message.beforeTestCaseHookDefinitionIds,
      (id: string, index: number) => {
        this.supportCodeIdMap[
          id
        ] = this.supportCodeLibrary.beforeTestCaseHookDefinitions[index].id
      }
    )
    _.each(
      message.afterTestCaseHookDefinitionIds,
      (id: string, index: number) => {
        this.supportCodeIdMap[
          id
        ] = this.supportCodeLibrary.afterTestCaseHookDefinitions[index].id
      }
    )
  }

  remapDefinitionIds(testCase: messages.ITestCase): void {
    for (const testStep of testCase.testSteps) {
      if (testStep.hookId !== '') {
        testStep.hookId = this.supportCodeIdMap[testStep.hookId]
      }
      if (doesHaveValue(testStep.stepDefinitionIds)) {
        testStep.stepDefinitionIds = testStep.stepDefinitionIds.map(
          (id) => this.supportCodeIdMap[id]
        )
      }
    }
  }

  awakenWorkers(triggeringWorker: IWorker): void {
    _.each(this.workers, (worker): boolean => {
      if (worker.state === WorkerState.idle) {
        this.giveWork(worker)
      }
      return worker.state !== WorkerState.idle
    })

    if (_.isEmpty(this.inProgressPickles) && this.pickleIds.length > 0) {
      this.giveWork(triggeringWorker, true)
      this.idleInterventions++
    }
  }

  startWorker(id: string, total: number): void {
    const workerProcess = fork(runWorkerPath, [], {
      cwd: this.cwd,
      env: _.assign({}, process.env, {
        CUCUMBER_PARALLEL: 'true',
        CUCUMBER_TOTAL_WORKERS: total,
        CUCUMBER_WORKER_ID: id,
      }),
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
        supportCodePaths: this.supportCodePaths,
        supportCodeRequiredModules: this.supportCodeRequiredModules,
        options: this.options,
      },
    }
    worker.process.send(initializeCommand)
  }

  onWorkerProcessClose(exitCode: number): void {
    if (exitCode !== 0) {
      this.success = false
    }
    if (_.every(this.workers, ({ state }) => state === WorkerState.closed)) {
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testRunFinished: {
            timestamp: this.stopwatch.timestamp(),
          },
        })
      )
      this.onFinish(this.success)
    }
  }

  parseTestCaseResult(testCaseFinished: messages.ITestCaseFinished): void {
    const { worstTestStepResult } = this.eventDataCollector.getTestCaseAttempt(
      testCaseFinished.testCaseStartedId
    )
    if (
      !worstTestStepResult.willBeRetried &&
      this.shouldCauseFailure(worstTestStepResult.status)
    ) {
      this.success = false
    }
  }

  run(numberOfWorkers: number, done: (success: boolean) => void): void {
    this.eventBroadcaster.emit(
      'envelope',
      new messages.Envelope({
        testRunStarted: {
          timestamp: this.stopwatch.timestamp(),
        },
      })
    )
    this.stopwatch.start()
    _.times(numberOfWorkers, (id) =>
      this.startWorker(id.toString(), numberOfWorkers)
    )
    this.onFinish = (status) => {
      if (this.idleInterventions > 0) {
        console.warn(
          `WARNING: All workers went idle ${this.idleInterventions} time(s). Consider revising handler passed to setParallelCanAssign.`
        )
      }

      done(status)
    }
  }

  nextPicklePlacement(): IPicklePlacement {
    for (let index = 0; index < this.pickleIds.length; index++) {
      const placement = this.placementAt(index)
      if (
        this.supportCodeLibrary.parallelCanAssign(
          placement.pickle,
          _.values(this.inProgressPickles)
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
        gherkinDocument,
      },
    }
    worker.state = WorkerState.running
    worker.process.send(runCommand)
  }

  shouldCauseFailure(
    status: messages.TestStepFinished.TestStepResult.Status
  ): boolean {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }
}
