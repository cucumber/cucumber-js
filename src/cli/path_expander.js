import _ from 'lodash'
import fs from 'mz/fs'
import glob from 'glob'
import path from 'path'
import Promise from 'bluebird'

export default class PathExpander {
  constructor(directory) {
    this.directory = directory
  }

  async expandPathsWithExtensions(paths, extensions) {
    const expandedPaths = await Promise.map(paths, async p => {
      return await this.expandPathWithExtensions(p, extensions)
    })
    return _.uniq(_.flatten(expandedPaths))
  }

  async expandPathWithExtensions(p, extensions) {
    const fullPath = path.resolve(this.directory, p)
    const stats = await fs.stat(fullPath)
    if (stats.isDirectory()) {
      return await this.expandDirectoryWithExtensions(fullPath, extensions)
    } else {
      return [fullPath]
    }
  }

  async expandDirectoryWithExtensions(realPath, extensions) {
    let pattern = realPath + '/**/*.'
    if (extensions.length > 1) {
      pattern += '{' + extensions.join(',') + '}'
    } else {
      pattern += extensions[0]
    }
    const results = await Promise.promisify(glob)(pattern)
    return results.map(filePath => filePath.replace(/\//g, path.sep))
  }
}
