import { locateFile } from '../configuration/locate_file'
import {
  DEFAULT_CONFIGURATION,
  fromFile,
  mergeConfigurations,
} from '../configuration'
import { validateConfiguration } from '../configuration/validate_configuration'
import { ILogger } from '../logger'
import { convertConfiguration } from './convert_configuration'
import { mergeEnvironment } from './environment'
import {
  IRunEnvironment,
  IResolvedConfiguration,
  ILoadConfigurationOptions,
} from './types'
import { ConsoleLogger } from './console_logger'

/**
 * Load user-authored configuration to be used in a test run.
 *
 * @public
 * @param options - Coordinates required to find configuration.
 * @param environment - Project environment.
 */
export async function loadConfiguration(
  options: ILoadConfigurationOptions = {},
  environment: IRunEnvironment = {}
): Promise<IResolvedConfiguration> {
  const { cwd, stderr, env, debug } = mergeEnvironment(environment)
  const logger: ILogger = new ConsoleLogger(stderr, debug)
  const configFile = options.file ?? locateFile(cwd)
  if (configFile) {
    logger.debug(`Configuration will be loaded from "${configFile}"`)
  } else {
    logger.debug('No configuration file found')
  }
  const profileConfiguration = configFile
    ? await fromFile(logger, cwd, configFile, options.profiles)
    : {}
  const original = mergeConfigurations(
    DEFAULT_CONFIGURATION,
    profileConfiguration,
    options.provided
  )
  logger.debug('Resolved configuration:', original)
  validateConfiguration(original, logger)
  const runnable = await convertConfiguration(logger, original, env)
  return {
    useConfiguration: original,
    runConfiguration: runnable,
  }
}
