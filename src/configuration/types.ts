import { JsonObject } from 'type-fest'

export interface IConfiguration {
  backtrace: boolean
  dryRun: boolean
  forceExit: boolean
  failFast: boolean
  format: Array<string | [string, string?]>
  formatOptions: JsonObject
  import: string[]
  language: string
  name: string[]
  order: 'defined' | 'random' | string
  paths: string[]
  parallel: number
  publish: boolean
  /**
   * @deprecated no longer needed; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
   */
  publishQuiet: boolean
  require: string[]
  requireModule: string[]
  retry: number
  retryTagFilter: string
  strict: boolean
  tags: string
  worldParameters: JsonObject
}
