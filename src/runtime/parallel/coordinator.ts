import _ from 'lodash'
import { ChildProcess, fork } from 'child_process'
import path from 'path'
import { retriesForPickle } from '../helpers'
import * as messages from '@cucumber/messages'
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
  process: ChildProcess
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
  private workers: Record<string, IWorker>
  private supportCodeIdMap: Record<string, string>
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
    this.supportCodeIdMap = {}
  }

  parseWorkerMessage(worker: IWorker, message: ICoordinatorReport): void {
    if (doesHaveValue(message.supportCodeIds)) {
      this.saveDefinitionIdMapping(message.supportCodeIds)
    } else if (message.ready) {
      this.giveWork(worker)
    } else if (doesHaveValue(message.jsonEnvelope)) {
      const envelope = messages.parseEnvelope(message.jsonEnvelope)
      this.eventBroadcaster.emit('envelope', envelope)
      if (doesHaveValue(envelope.testCase)) {
        this.remapDefinitionIds(envelope.testCase)
      }
      if (doesHaveValue(envelope.testCaseFinished)) {
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

  remapDefinitionIds(testCase: messages.TestCase): void {
    for (const testStep of testCase.testSteps) {
      if (doesHaveValue(testStep.hookId)) {
        testStep.hookId = this.supportCodeIdMap[testStep.hookId]
      }
      if (doesHaveValue(testStep.stepDefinitionIds)) {
        testStep.stepDefinitionIds = testStep.stepDefinitionIds.map(
          (id) => this.supportCodeIdMap[id]
        )
      }
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
    const worker = { closed: false, process: workerProcess }
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
    const success = exitCode === 0
    if (!success) {
      this.success = false
    }
    if (_.every(this.workers, 'closed')) {
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
      !worstTestStepResult.willBeRetried &&
      this.shouldCauseFailure(worstTestStepResult.status)
    ) {
      this.success = false
    }
  }

  run(numberOfWorkers: number, done: (success: boolean) => void): void {
    const envelope: messages.Envelope = {
      testRunStarted: {
        timestamp: this.stopwatch.timestamp(),
      },
    }
    this.eventBroadcaster.emit('envelope', envelope)
    this.stopwatch.start()
    _.times(numberOfWorkers, (id) =>
      this.startWorker(id.toString(), numberOfWorkers)
    )
    this.onFinish = done
  }

  giveWork(worker: IWorker): void {
    if (this.nextPickleIdIndex === this.pickleIds.length) {
      const finalizeCommand: IWorkerCommand = { finalize: true }
      worker.process.send(finalizeCommand)
      return
    }
    const pickleId = this.pickleIds[this.nextPickleIdIndex]
    this.nextPickleIdIndex += 1
    const pickle = this.eventDataCollector.getPickle(pickleId)
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
    worker.process.send(runCommand)
  }

  shouldCauseFailure(status: messages.TestStepResultStatus): boolean {
    return (
      _.includes(['AMBIGUOUS', 'FAILED', 'UNDEFINED'], status) ||
      (status === 'PENDING' && this.options.strict)
    )
  }
}
