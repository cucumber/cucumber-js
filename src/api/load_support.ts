import { IdGenerator } from '@cucumber/messages'
import { resolvePaths } from '../paths'
import {
  ILoadSupportOptions,
  IRunEnvironment,
  ISupportCodeLibrary,
} from './types'
import { getSupportCodeLibrary } from './support'
import { mergeEnvironment } from './environment'
import { initializeForLoadSupport } from './plugins'

/**
 * Load support code for use in test runs
 *
 * @public
 * @param options - Options required to find the support code
 * @param environment - Project environment
 */
export async function loadSupport(
  options: ILoadSupportOptions,
  environment: IRunEnvironment = {}
): Promise<ISupportCodeLibrary> {
  const mergedEnvironment = mergeEnvironment(environment)
  const { cwd, logger } = mergedEnvironment
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
  const supportCodeLibrary = await getSupportCodeLibrary({
    cwd,
    newId,
    requireModules: options.support.requireModules,
    requirePaths,
    importPaths,
  })
  await pluginManager.cleanup()
  return supportCodeLibrary
}
