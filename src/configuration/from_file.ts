import stringArgv from 'string-argv'
import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import readPkgUp from 'read-pkg-up'
import { promisify } from 'util'
import { pathToFileURL } from 'url'
import { IConfiguration } from './types'
import { mergeConfigurations } from './merge_configurations'
import ArgvParser from './argv_parser'
import { checkSchema } from './check_schema'
import { ILogger } from '../logger'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

export async function fromFile(
  logger: ILogger,
  cwd: string,
  file: string,
  profiles: string[] = []
): Promise<Partial<IConfiguration>> {
  const definitions = await loadFile(logger, cwd, file)
  if (!definitions.default) {
    logger.debug('No default profile defined in configuration file')
    definitions.default = {}
  }
  if (profiles.length < 1) {
    logger.debug('No profiles specified; using default profile')
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
      extractConfiguration(logger, profileKey, definitions[profileKey])
    )
  )
}

async function loadFile(
  logger: ILogger,
  cwd: string,
  file: string
): Promise<Record<string, any>> {
  const filePath: string = path.join(cwd, file)
  const extension = path.extname(filePath)
  let definitions
  switch (extension) {
    case '.json':
      definitions = JSON.parse(
        await promisify(fs.readFile)(filePath, { encoding: 'utf-8' })
      )
      break
    case '.yaml':
    case '.yml':
      definitions = YAML.parse(
        await promisify(fs.readFile)(filePath, { encoding: 'utf-8' })
      )
      break
    case '.cjs':
      logger.debug(
        `Loading configuration file "${file}" as CommonJS based on extension`
      )
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      definitions = require(filePath)
      break
    case '.mjs':
      logger.debug(
        `Loading configuration file "${file}" as ESM based on extension`
      )
      definitions = await importer(pathToFileURL(filePath))
      break
    case '.js':
      {
        const parentPackage = await readPackageJson(filePath)
        if (!parentPackage) {
          logger.debug(
            `Loading configuration file "${file}" as CommonJS based on absence of a parent package`
          )
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          definitions = require(filePath)
        } else if (parentPackage.type === 'module') {
          logger.debug(
            `Loading configuration file "${file}" as ESM based on "${parentPackage.name}" package type`
          )
          definitions = await importer(pathToFileURL(filePath))
        } else {
          logger.debug(
            `Loading configuration file "${file}" as CommonJS based on "${parentPackage.name}" package type`
          )
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          definitions = require(filePath)
        }
      }
      break
    default:
      throw new Error(`Unsupported configuration file extension "${extension}"`)
  }
  if (typeof definitions !== 'object') {
    throw new Error(`Configuration file ${filePath} does not export an object`)
  }
  return definitions
}

async function readPackageJson(filePath: string) {
  const parentPackage = await readPkgUp({ cwd: path.dirname(filePath) })
  return parentPackage?.packageJson
}

function extractConfiguration(
  logger: ILogger,
  name: string,
  definition: any
): Partial<IConfiguration> {
  if (typeof definition === 'string') {
    logger.debug(`Profile "${name}" value is a string; parsing as argv`)
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
