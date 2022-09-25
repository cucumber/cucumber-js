import { Plugin, PluginManager } from '../plugin'
import publishPlugin from '../publish'
import { IRunEnvironment, IRunOptions } from './types'
import { ILogger } from '../logger'

const INTERNAL_PLUGINS: Record<string, Plugin> = {
  publish: publishPlugin,
}

export async function initializePlugins(
  logger: ILogger,
  configuration: IRunOptions,
  environment: IRunEnvironment
): Promise<PluginManager> {
  // eventually we'll load plugin packages here
  const pluginManager = new PluginManager(Object.values(INTERNAL_PLUGINS))
  await pluginManager.init(logger, configuration, environment)
  return pluginManager
}
