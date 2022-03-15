import { IRunEnvironment, IResolvedConfiguration } from './types'
import { locateFile } from '../configuration/locate_file'
import {
  DEFAULT_CONFIGURATION,
  fromFile,
  IConfiguration,
  mergeConfigurations,
} from '../configuration'
import { validateConfiguration } from '../configuration/validate_configuration'
import { convertConfiguration } from './convert_configuration'
import { mergeEnvironment } from './environment'

export async function loadConfiguration(
  options: {
    file?: string
    profiles?: string[]
    provided?: Partial<IConfiguration>
  },
  environment: IRunEnvironment
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
    original,
    runnable,
  }
}
