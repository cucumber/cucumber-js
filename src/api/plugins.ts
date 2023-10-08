import { Plugin, PluginManager } from '../plugin'
import publishPlugin from '../publish'
import { ILogger } from '../logger'
import { IRunEnvironment, IRunOptions } from './types'

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
