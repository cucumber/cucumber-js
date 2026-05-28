import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import type { IdGenerator } from '@cucumber/messages'
import type { ILogger } from '../environment'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import type { SupportCodeLibrary } from '../support_code_library_builder/types'
import tryRequire from '../try_require'

export async function getSupportCodeLibrary({
  logger,
  cwd,
  newId,
  requireModules,
  requirePaths,
  importPaths,
  loaders,
}: {
  logger: ILogger
  cwd: string
  newId: IdGenerator.NewId
  requireModules: string[]
  requirePaths: string[]
  importPaths: string[]
  loaders: string[]
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
    await import(pathToFileURL(path).toString())
  }

  return supportCodeLibraryBuilder.finalize()
}
