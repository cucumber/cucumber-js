import { IdGenerator } from '@cucumber/messages'
import { resolvePaths } from '../paths'
import {
  ILoadSourcesResult,
  IPlannedPickle,
  IRunEnvironment,
  ISourcesCoordinates,
  ISourcesError,
} from './types'
import { mergeEnvironment } from './environment'
import { getPicklesAndErrors } from './gherkin'
import { initializeForLoadSources } from './plugins'

/**
 * Load and parse features, produce a filtered and ordered test plan and/or
 * parse errors
 *
 * @public
 * @param coordinates - Coordinates required to find and process features
 * @param environment - Project environment
 */
export async function loadSources(
  coordinates: ISourcesCoordinates,
  environment: IRunEnvironment = {}
): Promise<ILoadSourcesResult> {
  const mergedEnvironment = mergeEnvironment(environment)
  const { cwd, logger } = mergedEnvironment
  const newId = IdGenerator.uuid()
  const pluginManager = await initializeForLoadSources(
    logger,
    coordinates,
    mergedEnvironment
  )
  const resolvedPaths = await resolvePaths(logger, cwd, coordinates)
  pluginManager.emit('paths:resolve', resolvedPaths)
  const { sourcePaths } = resolvedPaths
  if (sourcePaths.length === 0) {
    return {
      plan: [],
      errors: [],
    }
  }
  const { filterablePickles, parseErrors } = await getPicklesAndErrors({
    newId,
    cwd,
    sourcePaths,
    coordinates,
    onEnvelope: (envelope) => pluginManager.emit('message', envelope),
  })
  const filteredPickles = await pluginManager.transform(
    'pickles:filter',
    filterablePickles
  )
  const orderedPickles = await pluginManager.transform(
    'pickles:order',
    filteredPickles
  )
  const plan: IPlannedPickle[] = orderedPickles.map(({ location, pickle }) => ({
    name: pickle.name,
    uri: pickle.uri,
    location,
  }))
  const errors: ISourcesError[] = parseErrors.map(({ source, message }) => {
    return {
      uri: source.uri,
      location: source.location,
      message,
    }
  })
  await pluginManager.cleanup()
  return {
    plan,
    errors,
  }
}
