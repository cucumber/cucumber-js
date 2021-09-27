import fs from 'mz/fs'
import path from 'path'
import stringArgv from 'string-argv'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'

const DEFAULT_FILENAMES = ['cucumber.cjs', 'cucumber.js']

export default class ProfileLoader {
  constructor(private readonly directory: string) {}

  async getDefinitions(configFile?: string): Promise<Record<string, string>> {
    if (configFile) {
      return this.loadFile(configFile)
    }

    const defaultFile = DEFAULT_FILENAMES.find((filename) =>
      fs.existsSync(path.join(this.directory, filename))
    )

    if (defaultFile) {
      return this.loadFile(defaultFile)
    }

    return {}
  }

  loadFile(configFile: string): Record<string, string> {
    const definitionsFilePath: string = path.join(this.directory, configFile)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const definitions = require(definitionsFilePath)
    if (typeof definitions !== 'object') {
      throw new Error(`${definitionsFilePath} does not export an object`)
    }
    return definitions
  }

  async getArgv(profiles: string[], configFile?: string): Promise<string[]> {
    const definitions = await this.getDefinitions(configFile)
    if (profiles.length === 0 && doesHaveValue(definitions.default)) {
      profiles = ['default']
    }
    const argvs = profiles.map((profile) => {
      if (doesNotHaveValue(definitions[profile])) {
        throw new Error(`Undefined profile: ${profile}`)
      }
      return stringArgv(definitions[profile])
    })
    return argvs.flat()
  }
}
