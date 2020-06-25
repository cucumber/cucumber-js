import _, { Dictionary } from 'lodash'
import { fork, ChildProcess } from 'child_process'
import path from 'path'
import Status from '../../status'
import { retriesForPickle } from '../helpers'
import { messages } from 'cucumber-messages'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../../formatter/helpers'
import { IRuntimeOptions } from '..'
import { ISupportCodeLibrary } from '../../support_code_library_builder/types'
import {
  IMasterReport,
  IMasterReportSupportCodeIds,
  ISlaveCommand,
} from './command_types'
import { doesHaveValue } from '../../value_checker'

const runSlavePath = path.resolve(__dirname, 'run_worker.js')

export interface INewMasterOptions {
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
  private onFinish: (success: boolean) => void
  private nextPickleIdIndex: number
  private readonly options: IRuntimeOptions
  private readonly pickleIds: string[]
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
  }: INewMasterOptions) {
    this.cwd = cwd
    this.eventBroadcaster = eventBroadcaster
    this.eventDataCollector = eventDataCollector
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

  parseSlaveMessage(worker: IWorker, message: IMasterReport): void {
    if (doesHaveValue(message.supportCodeIds)) {
      this.saveDefinitionIdMapping(message.supportCodeIds)
    } else if (message.ready) {
      this.giveWork(worker)
    } else if (doesHaveValue(message.jsonEnvelope)) {
      const envelope = messages.Envelope.fromObject(
        JSON.parse(message.jsonEnvelope)
      )
      this.eventBroadcaster.emit('envelope', envelope)
      if (doesHaveValue(envelope.testCase)) {
        this.remapDefinitionIds(envelope.testCase)
      }
      if (doesHaveValue(envelope.testCaseFinished)) {
        this.parseTestCaseResult(envelope.testCaseFinished.testResult)
      }
    } else {
      throw new Error(
        `Unexpected message from worker: ${JSON.stringify(message)}`
      )
    }
  }

  saveDefinitionIdMapping(message: IMasterReportSupportCodeIds): void {
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

  startSlave(id: string, total: number): void {
    const workerProcess = fork(runSlavePath, [], {
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
    worker.process.on('message', (message: IMasterReport) => {
      this.parseSlaveMessage(worker, message)
    })
    worker.process.on('close', (exitCode) => {
      worker.closed = true
      this.onSlaveClose(exitCode)
    })
    const initializeCommand: ISlaveCommand = {
      initialize: {
        filterStacktraces: this.options.filterStacktraces,
        supportCodePaths: this.supportCodePaths,
        supportCodeRequiredModules: this.supportCodeRequiredModules,
        options: this.options,
      },
    }
    worker.process.send(initializeCommand)
  }

  onSlaveClose(exitCode: number): void {
    if (exitCode !== 0) {
      this.success = false
    }
    if (_.every(this.workers, 'closed')) {
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testRunFinished: { success: this.success },
        })
      )
      this.onFinish(this.success)
    }
  }

  parseTestCaseResult(testCaseResult: messages.ITestResult): void {
    if (
      !testCaseResult.willBeRetried &&
      this.shouldCauseFailure(testCaseResult.status)
    ) {
      this.success = false
    }
  }

  run(numberOfSlaves: number, done: (success: boolean) => void): void {
    this.eventBroadcaster.emit('test-run-started')
    _.times(numberOfSlaves, (id) =>
      this.startSlave(id.toString(), numberOfSlaves)
    )
    this.onFinish = done
  }

  giveWork(worker: IWorker): void {
    if (this.nextPickleIdIndex === this.pickleIds.length) {
      const finalizeCommand: ISlaveCommand = { finalize: true }
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
    const runCommand: ISlaveCommand = {
      run: {
        retries,
        skip,
        pickle,
        gherkinDocument,
      },
    }
    worker.process.send(runCommand)
  }

  shouldCauseFailure(status: messages.TestResult.Status): boolean {
    return (
      _.includes([Status.AMBIGUOUS, Status.FAILED, Status.UNDEFINED], status) ||
      (status === Status.PENDING && this.options.strict)
    )
  }
}
