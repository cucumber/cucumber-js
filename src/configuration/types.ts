import { JsonObject } from 'type-fest'
import { FormatOptions } from '../formatter'
import { PickleOrder } from '../models/pickle_order'

type FormatsConfiguration = Array<string | [string, string?]>

export interface IConfiguration {
  backtrace: boolean
  dryRun: boolean
  forceExit: boolean
  failFast: boolean
  format: FormatsConfiguration
  formatOptions: FormatOptions
  import: string[]
  language: string
  name: string[]
  order: PickleOrder
  paths: string[]
  parallel: number
  publish: boolean
  /**
   * @deprecated no longer needed; see <https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md>
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
