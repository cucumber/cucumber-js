import {
  IRunEnvironment,
  IResolvedConfiguration,
  ILoadConfigurationOptions,
} from './types'
import { locateFile } from '../configuration/locate_file'
import {
  DEFAULT_CONFIGURATION,
  fromFile,
  mergeConfigurations,
} from '../configuration'
import { validateConfiguration } from '../configuration/validate_configuration'
import { convertConfiguration } from './convert_configuration'
import { mergeEnvironment } from './environment'

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
  const { cwd, env } = mergeEnvironment(environment)
  const configFile = options.file ?? locateFile(cwd)
  const profileConfiguration = configFile
    ? await fromFile(cwd, configFile, options.profiles)
    : {}
  const original = mergeConfigurations(
    DEFAULT_CONFIGURATION,
    profileConfiguration,
    options.provided
  )
  validateConfiguration(original)
  const runnable = await convertConfiguration(original, env)
  return {
    useConfiguration: original,
    runConfiguration: runnable,
  }
}
