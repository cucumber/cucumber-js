import stringArgv from 'string-argv'
import { loadConfiguration } from '../api/load_configuration'
import type { IRunConfiguration } from '../api/types'
import ArgvParser from '../configuration/argv_parser'
import { mergeConfigurations } from '../configuration/merge_configurations'
import type { IConfiguration } from '../configuration/types'

/**
 * Resolves the configuration `runCucumber()` will use, honoring:
 * config file/profile (lowest priority) < `pluginConfig` (the object passed
 * to `cucumber(config)` in `vitest.config.ts`) < `CUCUMBER_OPTIONS` env var,
 * parsed as CLI arguments (highest priority) - e.g.
 * `CUCUMBER_OPTIONS='--tags @smoke'`. `--profile`/`--config` in
 * `CUCUMBER_OPTIONS` select which file/profile to load, same as the CLI.
 */
function resolveConfigurationOptions(pluginConfig: Partial<IConfiguration>): {
  provided: Partial<IConfiguration>
  file?: string
  profiles?: string[]
} {
  const cliOptions = process.env.CUCUMBER_OPTIONS
  if (!cliOptions) {
    return { provided: pluginConfig }
  }

  const { configuration: envConfiguration, options } = ArgvParser.parse([
    'node',
    'cucumber-js',
    ...stringArgv(cliOptions),
  ])
  return {
    provided: mergeConfigurations(pluginConfig, envConfiguration),
    file: options.config,
    profiles: options.profile?.length ? options.profile : undefined,
  }
}

/**
 * The structured configuration `runCucumber()` needs, resolved the same way
 * for both the real run (`global_setup.mts`) and deriving `test.include`
 * (`./resolve_include.ts`) - so the two can never see a different answer.
 */
export async function resolveRunConfiguration(
  pluginConfig: Partial<IConfiguration>,
  cwd: string
): Promise<IRunConfiguration> {
  const { provided, file, profiles } = resolveConfigurationOptions(pluginConfig)
  const { runConfiguration } = await loadConfiguration({ file, profiles, provided }, { cwd })
  return runConfiguration
}
