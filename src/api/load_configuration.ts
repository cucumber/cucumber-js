import { locateFile } from '../configuration/locate_file'
import {
  DEFAULT_CONFIGURATION,
  fromFile,
  mergeConfigurations,
  parseConfiguration,
  validateConfiguration,
} from '../configuration'
import { IRunEnvironment, makeEnvironment } from '../environment'
import { convertConfiguration } from './convert_configuration'
import { ILoadConfigurationOptions, IResolvedConfiguration } from './types'

/**
 * Load user-authored configuration to be used in a test run
 *
 * @public
 * @param options - Coordinates required to find configuration
 * @param environment - Project environment
 */
export async function loadConfiguration(
  options: ILoadConfigurationOptions = {},
  environment: IRunEnvironment = {}
): Promise<IResolvedConfiguration> {
  const { cwd, env, logger } = makeEnvironment(environment)
  const configFile = options.file ?? locateFile(cwd)
  if (configFile) {
    logger.debug(`Configuration will be loaded from "${configFile}"`)
  } else if (configFile === false) {
    logger.debug('Skipping configuration file resolution')
  } else {
    logger.debug('No configuration file found')
  }
  const profileConfiguration = configFile
    ? await fromFile(logger, cwd, configFile, options.profiles)
    : {}
  const providedConfiguration = parseConfiguration(
    logger,
    'Provided',
    options.provided
  )
  if (
    profileConfiguration.paths?.length > 0 &&
    providedConfiguration.paths?.length > 0
  ) {
    const configPaths = profileConfiguration.paths
    const cliPaths = providedConfiguration.paths
    const mergedPaths = [...configPaths, ...cliPaths]
    logger.warn(
      `You have specified paths in both your configuration file and as CLI arguments.\n` +
        `In a future major version, the CLI argument will override the configuration file instead of being merged.\n` +
        `To prepare for this change, see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md\n` +
        `  Current result:     ${mergedPaths.join(', ')}\n` +
        `  Future result:      ${cliPaths.join(', ')}`
    )
  }
  const original = mergeConfigurations(
    DEFAULT_CONFIGURATION,
    profileConfiguration,
    providedConfiguration
  )
  logger.debug('Resolved configuration:', original)
  validateConfiguration(original, logger)
  const runnable = await convertConfiguration(logger, original, env)
  return {
    useConfiguration: original,
    runConfiguration: runnable,
  }
}
