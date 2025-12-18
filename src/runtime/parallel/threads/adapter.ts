import { EventEmitter } from 'node:events'
import { Worker } from 'node:worker_threads'
import path from 'node:path'
import { setInterval } from 'node:timers/promises'
import { RuntimeAdapter } from '../../types'
import { AssembledTestCase } from '../../../assemble'
import { ILogger, IRunEnvironment } from '../../../environment'
import { IRunOptionsRuntime } from '../../../api'
import { FormatOptions } from '../../../formatter'
import { SupportCodeLibrary } from '../../../support_code_library_builder/types'
import { WorkerCommand, WorkerData, WorkerEvent } from './types'

type ManagedWorker = {
  id: string
  workerThread: Worker
  ready: boolean
}

export class WorkerThreadsAdapter implements RuntimeAdapter {
  private failing: boolean = false
  private readonly todo: Array<AssembledTestCase> = []
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

  private async setupWorkers() {
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

  private async teardownWorkers() {
    for (const worker of this.workers.values()) {
      await worker.workerThread.terminate()
    }
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
      case 'FINISHED':
        this.running.delete(worker)
        if (!event.success) {
          this.failing = true
        }
        this.allocateTestCases()
        break
    }
  }

  async run(
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ): Promise<boolean> {
    await this.setupWorkers()
    // TODO run BeforeAll hooks
    await this.runTestCases(assembledTestCases)
    // TODO run AfterAll hooks
    await this.teardownWorkers()
    return !this.failing
  }

  private async runTestCases(
    assembledTestCases: ReadonlyArray<AssembledTestCase>
  ) {
    this.todo.push(...assembledTestCases)
    this.allocateTestCases()
    for await (const started of setInterval(100, performance.now())) {
      if (this.todo.length === 0 && this.running.size === 0) {
        this.logger.debug(`Ran test cases in ${performance.now() - started}`)
        break
      }
    }
  }

  private allocateTestCases() {
    if (this.todo.length === 0) {
      return
    }
    for (const managedWorker of this.workers) {
      if (!this.running.has(managedWorker)) {
        const assembledTestCase = this.todo.shift()
        if (assembledTestCase) {
          this.issueCommandToWorker(managedWorker, {
            type: 'TEST_CASE',
            assembledTestCase,
            failing: this.failing,
          })
        }
      }
    }
  }
}
