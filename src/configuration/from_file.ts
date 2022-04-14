import stringArgv from 'string-argv'
import path from 'path'
import { pathToFileURL } from 'url'
import { IConfiguration } from './types'
import { mergeConfigurations } from './merge_configurations'
import ArgvParser from './argv_parser'
import { checkSchema } from './check_schema'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

export async function fromFile(
  cwd: string,
  file: string,
  profiles: string[] = []
): Promise<Partial<IConfiguration>> {
  const definitions = await loadFile(cwd, file)
  if (!definitions.default) {
    definitions.default = {}
  }
  if (profiles.length < 1) {
    profiles = ['default']
  }
  const definedKeys = Object.keys(definitions)
  profiles.forEach((profileKey) => {
    if (!definedKeys.includes(profileKey)) {
      throw new Error(`Requested profile "${profileKey}" doesn't exist`)
    }
  })
  return mergeConfigurations(
    {},
    ...profiles.map((profileKey) =>
      extractConfiguration(profileKey, definitions[profileKey])
    )
  )
}

async function loadFile(
  cwd: string,
  file: string
): Promise<Record<string, any>> {
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
    throw new Error(`Configuration file ${filePath} does not export an object`)
  }
  return definitions
}

function extractConfiguration(
  name: string,
  definition: any
): Partial<IConfiguration> {
  if (typeof definition === 'string') {
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
      `Requested profile "${name}" failed schema validation: ${error.errors.join(
        ' '
      )}`
    )
  }
}
