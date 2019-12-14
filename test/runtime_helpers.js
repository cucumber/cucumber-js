import { SupportCodeLibraryBuilder } from '../src/support_code_library_builder'
import { incrementing } from 'cucumber-messages/dist/src/IdGenerator'

export function buildOptions(overrides) {
  return {
    dryRun: false,
    failFast: false,
    filterStacktraces: false,
    retry: 0,
    retryTagFilter: '',
    strict: true,
    timeout: 5000,
    ...overrides,
  }
}

export function buildSupportCodeLibrary(cwd = __dirname, fn = () => {}) {
  if (typeof cwd === 'function') {
    fn = cwd
    cwd = __dirname
  }
  const supportCodeLibraryBuilder = new SupportCodeLibraryBuilder()
  supportCodeLibraryBuilder.reset(cwd, incrementing())
  fn(supportCodeLibraryBuilder.methods)
  return supportCodeLibraryBuilder.finalize()
}
