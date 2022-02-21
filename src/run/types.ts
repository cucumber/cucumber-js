import { Writable } from 'stream';
import { ISupportCodeLibrary } from '../support_code_library_builder/types'

export interface IRunEnvironment {
  cwd: string
  stdout: Writable
  stderr: Writable
  env: NodeJS.ProcessEnv
}

export interface IRunResult {
  success: boolean
  support: ISupportCodeLibrary
}
