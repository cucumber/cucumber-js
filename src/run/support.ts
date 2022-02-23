import { IdGenerator } from '@cucumber/messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import { pathToFileURL } from 'url'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

export async function getSupportCodeLibrary({
  cwd,
  newId,
  requireModules,
  requirePaths,
  importPaths,
}: {
  cwd: string
  newId: IdGenerator.NewId
  requireModules: string[]
  requirePaths: string[]
  importPaths: string[]
}): Promise<ISupportCodeLibrary> {
  supportCodeLibraryBuilder.reset(cwd, newId)
  requireModules.map((module) => require(module))
  requirePaths.map((path) => require(path))
  for (const path of importPaths) {
    await importer(pathToFileURL(path))
  }
  return supportCodeLibraryBuilder.finalize()
}
