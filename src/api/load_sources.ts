import {
  ILoadSourcesResult,
  IPlannedPickle,
  IRunEnvironment,
  ISourcesCoordinates,
  ISourcesError,
} from './types'
import { resolvePaths } from './paths'
import { IdGenerator } from '@cucumber/messages'
import { Console } from 'console'
import { mergeEnvironment } from './environment'
import { loadSourcesInternal } from './gherkin'

export async function loadSources(
  coordinates: ISourcesCoordinates,
  environment: IRunEnvironment = {}
): Promise<ILoadSourcesResult> {
  const { cwd, stderr } = mergeEnvironment(environment)
  const logger = new Console(stderr)
  const newId = IdGenerator.uuid()
  const { unexpandedFeaturePaths, featurePaths } = await resolvePaths(
    cwd,
    coordinates
  )
  const { filteredPickles, parseErrors } = await loadSourcesInternal({
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
