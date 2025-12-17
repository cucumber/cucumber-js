import { EventEmitter } from 'node:events'
import { RuntimeAdapter } from '../../types'
import { AssembledTestCase } from '../../../assemble'
import { ILogger, IRunEnvironment } from '../../../environment'
import { IRunOptionsRuntime } from '../../../api'
import { FormatOptions } from '../../../formatter'
import { SupportCodeLibrary } from '../../../support_code_library_builder/types'

export class WorkerThreadsAdapter implements RuntimeAdapter {
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
  
  run(assembledTestCases: ReadonlyArray<AssembledTestCase>): Promise<boolean> {
    return Promise.resolve(false)
  }
}