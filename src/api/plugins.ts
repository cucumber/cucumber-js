import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { UsableEnvironment } from '../environment'
import filterPlugin from '../filter'
import { PluginManager, Plugin } from '../plugin'
import publishPlugin from '../publish'
import shardingPlugin from '../sharding'
import { doesNotHaveValue } from '../value_checker'
import { IRunConfiguration, ISourcesCoordinates } from './types'

async function importPlugin(specifier: string, cwd: string): Promise<any> {
  try {
    let normalized: URL | string = specifier
    if (specifier.startsWith('.')) {
      normalized = pathToFileURL(path.resolve(cwd, specifier))
    } else if (specifier.startsWith('file://')) {
      normalized = new URL(specifier)
    }
    return await import(normalized.toString())
  } catch (e) {
    throw new Error(`Failed to import plugin ${specifier}`, {
      cause: e,
    })
  }
}

function findPlugin(imported: any): Plugin | null {
  return findPluginRecursive(imported, 3)
}

function findPluginRecursive(thing: any, depth: number): Plugin | null {
  if (doesNotHaveValue(thing)) {
    return null
  }
  if (typeof thing === 'object' && thing.type === 'plugin') {
    return thing
  }
  depth--
  if (depth > 0) {
    return findPluginRecursive(thing.default, depth)
  }
  return null
}

async function loadPlugin(specifier: string, cwd: string): Promise<Plugin> {
  const imported = await importPlugin(specifier, cwd)
  const found = findPlugin(imported)
  if (!found) {
    throw new Error(`${specifier} does not export a plugin`)
  }
  return found
}

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

  if (configuration.plugins) {
    for (const specifier of configuration.plugins.specifiers) {
      const plugin = await loadPlugin(specifier, environment.cwd)
      await pluginManager.initCoordinator(
        'runCucumber',
        plugin,
        configuration.plugins.options,
        specifier
      )
    }
  }

  return pluginManager
}
