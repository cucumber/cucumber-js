import { pathToFileURL } from 'node:url'
import { IdGenerator } from '@cucumber/messages'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import tryRequire from '../try_require'

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
}): Promise<SupportCodeLibrary> {
  supportCodeLibraryBuilder.reset(cwd, newId, {
    requireModules,
    requirePaths,
    importPaths,
  })

  requireModules.map((module) => tryRequire(module))
  requirePaths.map((path) => tryRequire(path))

  for (const path of importPaths) {
    await import(pathToFileURL(path).toString())
  }

  return supportCodeLibraryBuilder.finalize()
}
