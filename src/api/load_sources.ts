import {
  ILoadSourcesResult,
  IPlannedPickle,
  IRunEnvironment,
  ISourcesCoordinates,
  ISourcesError,
} from './types'
import { resolvePaths } from './paths'
import { IdGenerator } from '@cucumber/messages'
import { mergeEnvironment } from './environment'
import { getFilteredPicklesAndErrors } from './gherkin'
import { ConsoleLogger } from './console_logger'
import { ILogger } from '../logger'

/**
 * Load and parse features, produce a filtered and ordered test plan and/or parse errors.
 *
 * @public
 * @param coordinates - Coordinates required to find features
 * @param environment - Project environment.
 */
export async function loadSources(
  coordinates: ISourcesCoordinates,
  environment: IRunEnvironment = {}
): Promise<ILoadSourcesResult> {
  const { cwd, stderr, debug } = mergeEnvironment(environment)
  const logger: ILogger = new ConsoleLogger(stderr, debug)
  const newId = IdGenerator.uuid()
  const { unexpandedFeaturePaths, featurePaths } = await resolvePaths(
    logger,
    cwd,
    coordinates
  )
  if (featurePaths.length === 0) {
    return {
      plan: [],
      errors: [],
    }
  }
  const { filteredPickles, parseErrors } = await getFilteredPicklesAndErrors({
    newId,
    cwd,
    logger,
    unexpandedFeaturePaths,
    featurePaths,
    coordinates,
  })
  const plan: IPlannedPickle[] = filteredPickles.map(
    ({ location, pickle }) => ({
      name: pickle.name,
      uri: pickle.uri,
      location,
    })
  )
  const errors: ISourcesError[] = parseErrors.map(({ source, message }) => {
    return {
      uri: source.uri,
      location: source.location,
      message,
    }
  })
  return {
    plan,
    errors,
  }
}
