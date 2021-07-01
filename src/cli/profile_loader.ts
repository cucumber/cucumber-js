import fs from 'mz/fs'
import path from 'path'
import stringArgv from 'string-argv'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { IUserCodeImporter } from './index'

export default class ProfileLoader {
  constructor(
    private readonly directory: string,
    private readonly importer: IUserCodeImporter
  ) {}

  async getDefinitions(): Promise<Record<string, string>> {
    const definitionsFilePath = path.join(this.directory, 'cucumber.js')
    const exists = await fs.exists(definitionsFilePath)
    if (!exists) {
      return {}
    }
    const definitions = await this.importer(definitionsFilePath, true)
    if (typeof definitions !== 'object') {
      throw new Error(`${definitionsFilePath} does not export an object`)
    }
    return definitions
  }

  async getArgv(profiles: string[]): Promise<string[]> {
    const definitions = await this.getDefinitions()
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
