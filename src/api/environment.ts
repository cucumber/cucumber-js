import { IRunEnvironment } from './types'

export function mergeEnvironment(
  provided: IRunEnvironment
): Required<IRunEnvironment> {
  return Object.assign(
    {},
    {
      cwd: process.cwd(),
      stdout: process.stdout,
      stderr: process.stderr,
      env: process.env,
    },
    provided
  )
}
