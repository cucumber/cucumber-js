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

interface IWorker {
  closed: boolean
  idle: boolean
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
  private nextPickleIdIndex: number
  private readonly options: IRuntimeOptions
  private readonly pickleIds: string[]
  private inProgressPickles: Dictionary<messages.IPickle>
  private workers: Dictionary<IWorker>
  private supportCodeIdMap: Dictionary<string>
  private readonly supportCodeLibrary: ISupportCodeLibrary
  private readonly supportCodePaths: string[]
  private readonly supportCodeRequiredModules: string[]
  private success: boolean

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
    this.nextPickleIdIndex = 0
    this.success = true
    this.workers = {}
    this.inProgressPickles = {}
    this.supportCodeIdMap = {}
  }

  parseWorkerMessage(worker: IWorker, message: ICoordinatorReport): void {
    if (doesHaveValue(message.supportCodeIds)) {
      this.saveDefinitionIdMapping(message.supportCodeIds)
    } else if (message.ready) {
      this.awakenWorkers()
    } else if (doesHaveValue(message.jsonEnvelope)) {
      const envelope = messages.Envelope.fromObject(
        JSON.parse(message.jsonEnvelope)
      )
      this.eventBroadcaster.emit('envelope', envelope)
      if (doesHaveValue(envelope.testCase)) {
        this.remapDefinitionIds(envelope.testCase)
      }
      if (doesHaveValue(envelope.testCaseFinished)) {
        worker.idle = true
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

  awakenWorkers(): void {
    let oneWokeWorker = false
    _.forOwn(this.workers, (worker): boolean => {
      if (worker.idle) {
        this.giveWork(worker)
      }
      return (oneWokeWorker = oneWokeWorker || !worker.idle)
    })

    if (!oneWokeWorker && _.isEmpty(this.inProgressPickles)) {
      _.values(this.workers).forEach((worker) => {
        if (!worker.closed) {
          this.closeWorker(worker)
        }
      })
      console.error(
        'Bad state, all workers are idle! Check handler passed to setParallelCanAssign'
      )
      this.onFinish(false)
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
    const worker = { closed: false, idle: true, process: workerProcess, id }
    this.workers[id] = worker
    worker.process.on('message', (message: ICoordinatorReport) => {
      this.parseWorkerMessage(worker, message)
    })
    worker.process.on('close', (exitCode) => {
      worker.closed = true
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
    if (_.every(this.workers, 'closed')) {
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
    this.onFinish = done
  }

  nextPicklePlacement(): IPicklePlacement {
    for (
      let index = this.nextPickleIdIndex;
      index < this.pickleIds.length;
      index++
    ) {
      const pickle = this.eventDataCollector.getPickle(this.pickleIds[index])

      if (
        this.supportCodeLibrary.parallelCanAssign(
          pickle,
          _.values(this.inProgressPickles)
        )
      ) {
        return { index, pickle }
      }
    }

    return null
  }

  closeWorker(worker: IWorker): void {
    worker.idle = false
    const finalizeCommand: IWorkerCommand = { finalize: true }
    worker.process.send(finalizeCommand)
  }

  giveWork(worker: IWorker): void {
    if (this.nextPickleIdIndex >= this.pickleIds.length) {
      this.closeWorker(worker)
    }

    const picklePlacement = this.nextPicklePlacement()
    if (picklePlacement === null) {
      return
    }

    if (this.nextPickleIdIndex !== picklePlacement.index) {
      this.pickleIds.splice(
        picklePlacement.index,
        0,
        this.pickleIds.splice(this.nextPickleIdIndex, 1)[0]
      )
    }
    this.nextPickleIdIndex += 1
    const pickle = picklePlacement.pickle
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
    worker.idle = false
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
