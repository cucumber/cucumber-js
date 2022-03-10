import { IdGenerator } from '@cucumber/messages'
import { IRunEnvironment, ISourcesCoordinates } from './types'
import { resolvePaths } from './paths'
import { getSupportCodeLibrary } from './support'
import { ISupportCodeCoordinates } from '../support_code_library_builder/types'

export async function loadSupport(
  configuration: {
    sources: ISourcesCoordinates
    support: ISupportCodeCoordinates
  },
  { cwd = process.cwd() }: Partial<IRunEnvironment>
) {
  const newId = IdGenerator.uuid()
  const { requirePaths, importPaths } = await resolvePaths(
    cwd,
    configuration.sources,
    configuration.support
  )
  return await getSupportCodeLibrary({
    cwd,
    newId,
    requireModules: configuration.support.requireModules,
    requirePaths,
    importPaths,
  })
}
