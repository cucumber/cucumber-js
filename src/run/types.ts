import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { IFormatterStream } from '../formatter'

export interface IRunEnvironment {
  cwd: string
  stdout: IFormatterStream
  env: NodeJS.ProcessEnv
}

export interface IRunResult {
  success: boolean
  support: ISupportCodeLibrary
}
