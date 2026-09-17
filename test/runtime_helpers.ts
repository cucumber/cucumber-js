import { IdGenerator } from '@cucumber/messages'
import { PluginManager } from '../src/plugin'
import retryPlugin from '../src/retry'
import type { RuntimeOptions } from '../src/runtime'
import type { RetryDecider } from '../src/runtime/attempt_manager'
import { SupportCodeLibraryBuilder } from '../src/support_code_library_builder'
import type {
  IDefineSupportCodeMethods,
  SupportCodeLibrary,
} from '../src/support_code_library_builder/types'
import { doesHaveValue } from '../src/value_checker'
import { FakeLogger } from './fake_logger'

export function buildOptions(overrides: Partial<RuntimeOptions>): RuntimeOptions {
  return {
    dryRun: false,
    failFast: false,
    filterStacktraces: false,
    retry: 0,
    retryTagFilter: '',
    strict: true,
    worldParameters: {},
    ...overrides,
  }
}

/**
 * Builds a retry decider backed by the built-in retry plugin, for exercising
 * the runtime directly with the given options
 */
export async function buildShouldRetry(
  options: Pick<RuntimeOptions, 'retry' | 'retryTagFilter'>
): Promise<RetryDecider> {
  const pluginManager = new PluginManager({
    cwd: __dirname,
    stdout: process.stdout,
    stderr: process.stderr,
    env: {},
    debug: false,
    logger: new FakeLogger(),
  })
  await pluginManager.initCoordinatorInternal('runCucumber', retryPlugin, options)
  return (candidate) => pluginManager.transform('testCase:retry', false, candidate)
}

type DefineSupportCodeFunction = (methods: IDefineSupportCodeMethods) => void

export function buildSupportCodeLibrary(
  cwd: string | DefineSupportCodeFunction = __dirname,
  fn: DefineSupportCodeFunction = null
): SupportCodeLibrary {
  if (typeof cwd === 'function') {
    fn = cwd
    cwd = __dirname
  }
  const supportCodeLibraryBuilder = new SupportCodeLibraryBuilder()
  supportCodeLibraryBuilder.reset(cwd, IdGenerator.incrementing())
  if (doesHaveValue(fn)) {
    fn(supportCodeLibraryBuilder.methods)
  }
  return supportCodeLibraryBuilder.finalize()
}
