import type { ILogger } from '../environment'
import { checkSchema } from './check_schema'
import { DEFAULT_CONFIGURATION } from './default_configuration'
import type { IConfiguration } from './types'

const PREFIX = 'CUCUMBER_OPTION_'

/**
 * Map of environment variable name (e.g. `CUCUMBER_OPTION_RETRY_TAG_FILTER`) to
 * configuration key (e.g. `retryTagFilter`), derived from the known options so
 * that the round-trip is deterministic.
 */
const ENV_VAR_TO_OPTION: Record<string, keyof IConfiguration> = Object.fromEntries(
  Object.keys(DEFAULT_CONFIGURATION).map((option) => [
    PREFIX + toScreamingSnakeCase(option),
    option,
  ])
) as Record<string, keyof IConfiguration>

function toScreamingSnakeCase(option: string): string {
  return option.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()
}

/**
 * Parse a raw environment variable string into a configuration value.
 *
 * Values are parsed as JSON where possible, so that booleans, numbers, arrays
 * and objects can be expressed; anything that isn't valid JSON is kept as a
 * plain string (e.g. a tag expression like `@foo and @bar`).
 */
function parseValue(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * Build a partial configuration from environment variables.
 *
 * Each option is sought from the environment by converting its key to
 * uppercase-with-underscores and prefixing with `CUCUMBER_OPTION_`. So
 * `retryTagFilter` is expressed as `CUCUMBER_OPTION_RETRY_TAG_FILTER`.
 *
 * The resulting object is validated against the configuration schema, just like
 * configuration provided programmatically, so type errors are surfaced early.
 */
export function fromEnv(
  logger: ILogger,
  env: Record<string, string | undefined>
): Partial<IConfiguration> {
  const raw: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith(PREFIX) || value === undefined) {
      continue
    }
    const option = ENV_VAR_TO_OPTION[key]
    if (!option) {
      logger.debug(`Ignoring environment variable "${key}" as it doesn't map to a known option`)
      continue
    }
    raw[option] = parseValue(value)
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
