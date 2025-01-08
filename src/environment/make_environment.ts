import { ConsoleLogger } from './console_logger'
import { UsableEnvironment, IRunEnvironment } from './types'

export function makeEnvironment(provided: IRunEnvironment): UsableEnvironment {
  const fullEnvironment = Object.assign(
    {},
    {
      cwd: process.cwd(),
      stdout: process.stdout,
      stderr: process.stderr,
      env: process.env,
      debug: false,
    },
    provided
  )
  const logger = new ConsoleLogger(
    fullEnvironment.stderr,
    fullEnvironment.debug
  )
  logger.debug('Resolved environment:', fullEnvironment)
  return {
    ...fullEnvironment,
    logger: logger,
  }
}
