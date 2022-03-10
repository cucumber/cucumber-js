import { IRunConfiguration, IRunEnvironment } from './types'
import { locateFile } from '../configuration/locate_file'
import {
  DEFAULT_CONFIGURATION,
  fromFile,
  mergeConfigurations,
} from '../configuration'
import { validateConfiguration } from '../configuration/validate_configuration'
import { convertConfiguration } from './convert_configuration'

export async function loadConfiguration(
  options: {
    file?: string
    profiles?: string[]
  },
  { cwd = process.cwd(), env = process.env }: Partial<IRunEnvironment>
): Promise<IRunConfiguration> {
  const configFile = options.file ?? locateFile(cwd)
  const profileConfiguration = configFile
    ? await fromFile(cwd, configFile, options.profiles)
    : {}
  const configuration = mergeConfigurations(
    DEFAULT_CONFIGURATION,
    profileConfiguration
  )
  validateConfiguration(configuration)
  return await convertConfiguration(configuration, env)
}
