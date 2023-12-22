import { IdGenerator } from '@cucumber/messages'
import { SupportCodeLibraryBuilder } from '../src/support_code_library_builder'
import { IRuntimeOptions } from '../src/runtime'
import {
  IDefineSupportCodeMethods,
  SupportCodeLibrary,
} from '../src/support_code_library_builder/types'
import { doesHaveValue } from '../src/value_checker'

export function buildOptions(
  overrides: Partial<IRuntimeOptions>
): IRuntimeOptions {
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
