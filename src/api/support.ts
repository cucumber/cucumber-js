import { IdGenerator } from '@cucumber/messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import { pathToFileURL } from 'url'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

export async function getSupportCodeLibrary({
  cwd,
  newId,
  supportCodeRequiredModules,
  supportCodePaths,
}: {
  cwd: string
  newId: IdGenerator.NewId
  supportCodeRequiredModules: string[]
  supportCodePaths: string[]
}): Promise<ISupportCodeLibrary> {
  supportCodeLibraryBuilder.reset(cwd, newId)
  supportCodeRequiredModules.map((module) => require(module))
  for (const codePath of supportCodePaths) {
    if (supportCodeRequiredModules.length) {
      require(codePath)
    } else {
      await importer(pathToFileURL(codePath))
    }
  }
  return supportCodeLibraryBuilder.finalize()
}
