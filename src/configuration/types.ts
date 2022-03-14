import { FormatOptions } from '../formatter'
import { PickleOrder } from '../models/pickle_order'

export interface IConfiguration {
  backtrace: boolean
  dryRun: boolean
  forceExit: boolean
  failFast: boolean
  format: string[]
  formatOptions: FormatOptions
  import: string[]
  language: string
  name: string[]
  order: PickleOrder
  paths: string[]
  parallel: number
  publish: boolean
  publishQuiet: boolean
  require: string[]
  requireModule: string[]
  retry: number
  retryTagFilter: string
  strict: boolean
  tags: string
  worldParameters: any
}
