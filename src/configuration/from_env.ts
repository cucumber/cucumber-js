import { DEFAULT_CONFIGURATION } from './default_configuration'
import type { IConfiguration } from './types'

export function fromEnvironment(
  env: NodeJS.ProcessEnv
): Partial<IConfiguration> {
  const configuration: Partial<IConfiguration> = {}

  for (const key of Object.keys(DEFAULT_CONFIGURATION)) {
    const environmentVariable = toEnvironmentVariableName(key)
    const value = env[environmentVariable]

    if (value !== undefined) {
      configuration[key as keyof IConfiguration] = parseEnvironmentValue(value) as never
    }
  }

  return configuration
}

function toEnvironmentVariableName(key: string): string {
  return `CUCUMBER_${key
    .replace(/[A-Z]/g, (letter) => `_${letter}`)
    .toUpperCase()}`
}

function parseEnvironmentValue(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}