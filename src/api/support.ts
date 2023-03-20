import { IdGenerator } from '@cucumber/messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import { pathToFileURL } from 'url'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

function tryRequire(path:string) {
  try {
    return require(path);
  } catch (e) {
    throw new Error(`Cucumber expected a CommonJS module at '${path}' but found an ES module.
    Either change the file to CommonJS syntax or use the --import directive instead of --require`)
  }
}

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
  supportCodeLibraryBuilder.reset(cwd, newId, {
    requireModules,
    requirePaths,
    importPaths,
  })

  requireModules.map((module) => tryRequire(module))
  requirePaths.map((path) => tryRequire(path))
  
  for (const path of importPaths) {
    await importer(pathToFileURL(path))
  }
 
  return supportCodeLibraryBuilder.finalize()
}
