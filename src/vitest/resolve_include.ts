import type { IConfiguration } from '../configuration/types'
import { makeEnvironment } from '../environment'
import { resolvePaths } from '../paths'
import { resolveRunConfiguration } from './resolve_configuration'

/**
 * Derives Vitest's `test.include` from cucumber's own resolved source paths
 * (via `resolvePaths`, which handles globs, bare directories, `@rerun-file`
 * references and `:line` suffixes uniformly - a single glob string can't
 * always express this) - so it can never drift from what `runCucumber()`
 * will actually execute.
 */
export async function resolveInclude(
  pluginConfig: Partial<IConfiguration>,
  cwd: string
): Promise<string[]> {
  const runConfiguration = await resolveRunConfiguration(pluginConfig, cwd)
  const { logger } = makeEnvironment({ cwd })
  const { sourcePaths } = await resolvePaths(logger, cwd, runConfiguration.sources, {
    requireModules: [],
    requirePaths: [],
    importPaths: [],
    loaders: [],
    ...runConfiguration.support,
  })
  return sourcePaths
}
