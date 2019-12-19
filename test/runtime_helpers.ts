import {
  SupportCodeLibraryBuilder,
  IDefineSupportCodeMethods,
} from '../src/support_code_library_builder'
import { incrementing } from 'cucumber-messages/dist/src/IdGenerator'
import { IRuntimeOptions } from '../src/runtime'

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
  fn: DefineSupportCodeFunction = () => {}
) {
  if (typeof cwd === 'function') {
    fn = cwd
    cwd = __dirname
  }
  const supportCodeLibraryBuilder = new SupportCodeLibraryBuilder()
  supportCodeLibraryBuilder.reset(cwd, incrementing())
  fn(supportCodeLibraryBuilder.methods)
  return supportCodeLibraryBuilder.finalize()
}
