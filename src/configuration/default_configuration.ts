import { IConfiguration } from './types'

export const DEFAULT_CONFIGURATION: IConfiguration = {
  backtrace: false,
  dryRun: false,
  exit: false,
  failFast: false,
  format: [],
  formatOptions: {},
  import: [],
  language: 'en',
  name: [],
  order: 'defined',
  paths: [],
  parallel: 0,
  publish: false,
  publishQuiet: false,
  require: [],
  requireModule: [],
  retry: 0,
  retryTagFilter: '',
  strict: true,
  tags: '',
  worldParameters: {},
}
