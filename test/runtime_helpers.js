import { SupportCodeLibraryBuilder } from '../src/support_code_library_builder'

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

export function buildSupportCodeLibrary(cwd = '/', fn = () => {}) {
  const supportCodeLibraryBuilder = new SupportCodeLibraryBuilder()
  supportCodeLibraryBuilder.reset(cwd || '/')
  fn(supportCodeLibraryBuilder.methods)
  return supportCodeLibraryBuilder.finalize()
}
