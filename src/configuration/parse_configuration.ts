import stringArgv from 'string-argv'
import { ILogger } from '../logger'
import { IConfiguration } from './types'
import ArgvParser from './argv_parser'
import { checkSchema } from './check_schema'

export function parseConfiguration(
  logger: ILogger,
  source: string,
  definition: Partial<IConfiguration> | string[] | string | undefined
): Partial<IConfiguration> {
  if (!definition) {
    return {}
  }
  if (Array.isArray(definition)) {
    logger.debug(`${source} configuration value is an array; parsing as argv`)
    const { configuration } = ArgvParser.parse([
      'node',
      'cucumber-js',
      ...definition,
    ])
    return configuration
  }
  if (typeof definition === 'string') {
    logger.debug(`${source} configuration value is a string; parsing as argv`)
    const { configuration } = ArgvParser.parse([
      'node',
      'cucumber-js',
      ...stringArgv(definition),
    ])
    return configuration
  }
  try {
    return checkSchema(definition)
  } catch (error) {
    throw new Error(
      `${source} configuration value failed schema validation: ${error.errors.join(
        ' '
      )}`
    )
  }
}
