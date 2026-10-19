import type { ILogger } from '../environment'
import { checkSchema } from './check_schema'
import { DEFAULT_CONFIGURATION } from './default_configuration'
import type { IConfiguration } from './types'

/**
 * Build a partial configuration from environment variables, where e.g.
 * `retryTagFilter` is sought as `CUCUMBER_RETRY_TAG_FILTER`. Values are parsed
 * as JSON where possible, otherwise kept as strings.
 */
export function fromEnv(
  logger: ILogger,
  env: Record<string, string | undefined>
): Partial<IConfiguration> {
  const raw: Record<string, unknown> = {}
  for (const option of Object.keys(DEFAULT_CONFIGURATION)) {
    const value = env[`CUCUMBER_${option.replace(/([A-Z])/g, '_$1').toUpperCase()}`]
    if (value !== undefined) {
      raw[option] = parseValue(value)
    }
  }
  if (Object.keys(raw).length === 0) {
    return {}
  }
  logger.debug('Configuration from environment variables:', raw)
  try {
    return checkSchema(raw)
  } catch (error) {
    throw new Error(
      `Environment variable configuration value failed schema validation: ${error.errors.join(' ')}`
    )
  }
}

function parseValue(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}
