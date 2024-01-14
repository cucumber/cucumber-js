import { locateFile } from '../configuration/locate_file'
import {
  DEFAULT_CONFIGURATION,
  fromFile,
  mergeConfigurations,
  parseConfiguration,
  validateConfiguration,
} from '../configuration'
import { convertConfiguration } from './convert_configuration'
import { mergeEnvironment } from './environment'
import {
  IRunEnvironment,
  IResolvedConfiguration,
  ILoadConfigurationOptions,
} from './types'

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
  const { cwd, env, logger } = mergeEnvironment(environment)
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
  const original = mergeConfigurations(
    DEFAULT_CONFIGURATION,
    profileConfiguration,
    parseConfiguration(logger, 'Provided', options.provided)
  )
  logger.debug('Resolved configuration:', original)
  validateConfiguration(original, logger)
  const runnable = await convertConfiguration(logger, original, env)
  return {
    useConfiguration: original,
    runConfiguration: runnable,
  }
}
