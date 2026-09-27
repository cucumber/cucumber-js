import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import type { IdGenerator } from '@cucumber/messages'
import type { ILogger } from '../environment'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import type { SupportCodeLibrary } from '../support_code_library_builder/types'
import tryRequire from '../try_require'

/**
 * Loads a module by specifier, returning its namespace/exports.
 * @remarks
 * Defaults to a plain dynamic `import()`. Callers embedded in another
 * bundler's module graph (e.g. a Vitest plugin) can supply their own to load
 * support code through that same graph, so it shares module instances -
 * including singletons like `supportCodeLibraryBuilder` - with the rest of
 * their toolchain instead of via a disconnected, plain Node import.
 */
export type ModuleLoader = (specifier: string) => Promise<unknown>

const defaultModuleLoader: ModuleLoader = (specifier) =>
  import(pathToFileURL(specifier).toString())

export async function getSupportCodeLibrary({
  logger,
  cwd,
  newId,
  requireModules,
  requirePaths,
  importPaths,
  loaders,
  moduleLoader = defaultModuleLoader,
}: {
  logger: ILogger
  cwd: string
  newId: IdGenerator.NewId
  requireModules: string[]
  requirePaths: string[]
  importPaths: string[]
  loaders: string[]
  moduleLoader?: ModuleLoader
}): Promise<SupportCodeLibrary> {
  supportCodeLibraryBuilder.reset(cwd, newId, {
    requireModules,
    requirePaths,
    importPaths,
    loaders,
  })

  for (const path of requireModules) {
    logger.debug(`Attempting to require code from "${path}"`)
    tryRequire(path)
  }
  for (const path of requirePaths) {
    logger.debug(`Attempting to require code from "${path}"`)
    tryRequire(path)
  }

  for (const specifier of loaders) {
    logger.debug(`Attempting to register loader "${specifier}"`)
    register(specifier, pathToFileURL('./'))
  }

  for (const path of importPaths) {
    logger.debug(`Attempting to import code from "${path}"`)
    await moduleLoader(path)
  }

  return supportCodeLibraryBuilder.finalize()
}
