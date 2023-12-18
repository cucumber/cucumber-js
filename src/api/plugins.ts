import { PluginManager } from '../plugin'
import publishPlugin from '../publish'
import { ILogger } from '../logger'
import { IRunConfiguration, IRunEnvironment } from './types'

export async function initializePlugins(
  logger: ILogger,
  configuration: IRunConfiguration,
  environment: IRunEnvironment
): Promise<PluginManager> {
  // eventually we'll load plugin packages here
  const pluginManager = new PluginManager()
  await pluginManager.init(
    publishPlugin,
    configuration.formats.publish,
    logger,
    environment
  )
  return pluginManager
}
