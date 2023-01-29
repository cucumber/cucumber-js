import { IdGenerator } from '@cucumber/messages'
import { ILoadSupportOptions, IRunEnvironment } from './types'
import { resolvePaths } from './paths'
import { getSupportCodeLibrary } from './support'
import { mergeEnvironment } from './environment'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { ILogger } from '../logger'
import { ConsoleLogger } from './console_logger'

/**
 * Load support code for use in test runs.
 *
 * @public
 * @param options - Subset of `IRunnableConfiguration` required to find the support code.
 * @param environment - Project environment.
 */
export async function loadSupport(
  options: ILoadSupportOptions,
  environment: IRunEnvironment = {}
): Promise<ISupportCodeLibrary> {
  const { cwd, stderr, debug } = mergeEnvironment(environment)
  const logger: ILogger = new ConsoleLogger(stderr, debug)
  const newId = IdGenerator.uuid()
  const { requirePaths, importPaths } = await resolvePaths(
    logger,
    cwd,
    options.sources,
    options.support
  )
  return await getSupportCodeLibrary({
    cwd,
    newId,
    requireModules: options.support.requireModules,
    requirePaths,
    importPaths,
  })
}
