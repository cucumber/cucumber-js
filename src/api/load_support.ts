import { IdGenerator } from '@cucumber/messages'
import { IRunEnvironment, IRunnableConfiguration } from './types'
import { resolvePaths } from './paths'
import { getSupportCodeLibrary } from './support'
import { mergeEnvironment } from './environment'

export async function loadSupport(
  configuration: Pick<IRunnableConfiguration, 'sources' | 'support'>,
  environment: IRunEnvironment
) {
  const { cwd } = mergeEnvironment(environment)
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
