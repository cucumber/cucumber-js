import { IdGenerator } from '@cucumber/messages'
import { resolvePaths } from '../paths'
import { IRunEnvironment, makeEnvironment } from '../environment'
import { ILoadSupportOptions, ISupportCodeLibrary } from './types'
import { getSupportCodeLibrary } from './support'
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
  const mergedEnvironment = makeEnvironment(environment)
  const { cwd, logger } = mergedEnvironment
  const newId = IdGenerator.uuid()
  const supportCoordinates = Object.assign(
    {
      requireModules: [],
      requirePaths: [],
      loaders: [],
      importPaths: [],
    },
    options.support
  )
  const pluginManager = await initializeForLoadSupport(mergedEnvironment)
  const resolvedPaths = await resolvePaths(
    logger,
    cwd,
    options.sources,
    supportCoordinates
  )
  pluginManager.emit('paths:resolve', resolvedPaths)
  const { requirePaths, importPaths } = resolvedPaths
  const supportCodeLibrary = await getSupportCodeLibrary({
    logger,
    cwd,
    newId,
    requireModules: supportCoordinates.requireModules,
    requirePaths,
    loaders: supportCoordinates.loaders,
    importPaths,
  })
  await pluginManager.cleanup()
  return supportCodeLibrary
}
