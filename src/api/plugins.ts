import { PluginManager } from '../plugin'
import publishPlugin from '../publish'
import { ILogger } from '../logger'
import filterPlugin from '../filter'
import {
  IRunConfiguration,
  IRunEnvironment,
  ISourcesCoordinates,
} from './types'

export async function initializeForLoadSources(
  logger: ILogger,
  coordinates: ISourcesCoordinates,
  environment: Required<IRunEnvironment>
): Promise<PluginManager> {
  // eventually we'll load plugin packages here
  const pluginManager = new PluginManager()
  await pluginManager.initCoordinator(
    'loadSources',
    filterPlugin,
    coordinates,
    logger,
    environment
  )
  return pluginManager
}

export async function initializeForLoadSupport(): Promise<PluginManager> {
  // eventually we'll load plugin packages here
  return new PluginManager()
}

export async function initializeForRunCucumber(
  logger: ILogger,
  configuration: IRunConfiguration,
  environment: Required<IRunEnvironment>
): Promise<PluginManager> {
  // eventually we'll load plugin packages here
  const pluginManager = new PluginManager()
  await pluginManager.initCoordinator(
    'runCucumber',
    publishPlugin,
    configuration.formats.publish,
    logger,
    environment
  )
  await pluginManager.initCoordinator(
    'runCucumber',
    filterPlugin,
    configuration.sources,
    logger,
    environment
  )
  return pluginManager
}
