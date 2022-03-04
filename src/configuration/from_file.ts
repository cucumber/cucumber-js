import path from 'path'
import { pathToFileURL } from 'url'
import { IConfiguration } from './types'
import { mergeConfigurations } from './merge_configurations'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

export async function fromFile(
  cwd: string,
  file: string,
  profiles: string[]
): Promise<Partial<IConfiguration>> {
  const definitions = await loadFile(cwd, file)
  if (profiles.length === 0) {
    return definitions['default'] as Partial<IConfiguration>
  }
  const definedKeys = Object.keys(definitions)
  profiles.forEach((profileKey) => {
    if (!definedKeys.includes(profileKey)) {
      throw new Error(`Requested profile "${profileKey}" doesn't exist`)
    }
  })
  return mergeConfigurations(
    ...profiles.map((profileKey) => definitions[profileKey])
  )
}

async function loadFile(
  cwd: string,
  file: string
): Promise<Record<string, Partial<IConfiguration>>> {
  // TODO strings too!
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
