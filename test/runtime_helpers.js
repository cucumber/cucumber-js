import { SupportCodeLibraryBuilder } from '../src/support_code_library_builder'
import { incrementing } from 'gherkin/dist/src/IdGenerator'

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

export function buildSupportCodeLibrary(fn = () => {}) {
  const supportCodeLibraryBuilder = new SupportCodeLibraryBuilder()
  supportCodeLibraryBuilder.reset(__dirname, incrementing())
  fn(supportCodeLibraryBuilder.methods)
  return supportCodeLibraryBuilder.finalize()
}
