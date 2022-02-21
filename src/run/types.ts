import { ISupportCodeLibrary } from '../support_code_library_builder/types'

export interface IRunEnvironment {
  cwd: string
  stdout: NodeJS.WriteStream
  stderr: NodeJS.WriteStream
  env: NodeJS.ProcessEnv
}

export interface IRunResult {
  success: boolean
  support: ISupportCodeLibrary
}
