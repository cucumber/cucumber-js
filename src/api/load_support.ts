import { IdGenerator } from '@cucumber/messages'
import { IRunEnvironment, IRunnableConfiguration } from './types'
import { resolvePaths } from './paths'
import { getSupportCodeLibrary } from './support'

export async function loadSupport(
  configuration: Pick<IRunnableConfiguration, 'sources' | 'support'>,
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
