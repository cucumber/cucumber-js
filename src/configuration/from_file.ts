import stringArgv from 'string-argv'
import path from 'path'
import { pathToFileURL } from 'url'
import { IConfiguration } from './types'
import { mergeConfigurations } from './merge_configurations'
import ArgvParser from './argv_parser'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

export async function fromFile(
  cwd: string,
  file: string,
  profiles: string[]
): Promise<Partial<IConfiguration>> {
  const definitions = await loadFile(cwd, file)
  if (profiles.length === 0) {
    return extractConfiguration(definitions['default'])
  }
  const definedKeys = Object.keys(definitions)
  profiles.forEach((profileKey) => {
    if (!definedKeys.includes(profileKey)) {
      throw new Error(`Requested profile "${profileKey}" doesn't exist`)
    }
  })
  return mergeConfigurations(
    {},
    ...profiles
      .map((profileKey) => definitions[profileKey])
      .map((definition) => extractConfiguration(definition))
  )
}

async function loadFile(
  cwd: string,
  file: string
): Promise<Record<string, string | Partial<IConfiguration>>> {
  const filePath: string = path.join(cwd, file)
  let definitions
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    definitions = require(filePath)
  } catch (error) {
    if (error.code === 'ERR_REQUIRE_ESM') {
      definitions = await importer(pathToFileURL(filePath))
    } else {
      throw error
    }
  }
  if (typeof definitions !== 'object') {
    throw new Error(`${filePath} does not export an object`)
  }
  return definitions
}

function extractConfiguration(
  raw: string | Partial<IConfiguration>
): Partial<IConfiguration> {
  if (typeof raw === 'string') {
    const { configuration } = ArgvParser.parse([
      'node',
      'cucumber-js',
      ...stringArgv(raw),
    ])
    return configuration
  }
  return raw
}
