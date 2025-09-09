import { PluginManager } from '../plugin'
import publishPlugin from '../publish'
import filterPlugin from '../filter'
import shardingPlugin from '../sharding'
import { UsableEnvironment } from '../environment'
import { IRunConfiguration, ISourcesCoordinates } from './types'

export async function initializeForLoadSources(
  coordinates: ISourcesCoordinates,
  environment: UsableEnvironment
): Promise<PluginManager> {
  // eventually we'll load plugin packages here
  const pluginManager = new PluginManager(environment)
  await pluginManager.initCoordinator('loadSources', filterPlugin, coordinates)
  return pluginManager
}

export async function initializeForLoadSupport(
  environment: UsableEnvironment
): Promise<PluginManager> {
  // eventually we'll load plugin packages here
  return new PluginManager(environment)
}

export async function initializeForRunCucumber(
  configuration: IRunConfiguration,
  environment: UsableEnvironment
): Promise<PluginManager> {
  // eventually we'll load plugin packages here
  const pluginManager = new PluginManager(environment)
  await pluginManager.initCoordinator(
    'runCucumber',
    publishPlugin,
    configuration.formats.publish
  )
  await pluginManager.initCoordinator(
    'runCucumber',
    filterPlugin,
    configuration.sources
  )
  await pluginManager.initCoordinator(
    'runCucumber',
    shardingPlugin,
    configuration.sources
  )
  return pluginManager
}
