import { IdGenerator } from '@cucumber/messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { ILogger } from '../logger'
import { resolvePaths } from '../paths'
import { ILoadSupportOptions, IRunEnvironment } from './types'
import { getSupportCodeLibrary } from './support'
import { mergeEnvironment } from './environment'
import { ConsoleLogger } from './console_logger'
import { initializeForLoadSupport } from './plugins'

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
  const mergedEnvironment = mergeEnvironment(environment)
  const { cwd, stderr, debug } = mergedEnvironment
  const logger: ILogger = new ConsoleLogger(stderr, debug)
  const newId = IdGenerator.uuid()
  const pluginManager = await initializeForLoadSupport()
  const resolvedPaths = await resolvePaths(
    logger,
    cwd,
    options.sources,
    options.support
  )
  pluginManager.emit('paths:resolve', resolvedPaths)
  const { requirePaths, importPaths } = resolvedPaths
  return await getSupportCodeLibrary({
    cwd,
    newId,
    requireModules: options.support.requireModules,
    requirePaths,
    importPaths,
  })
}
