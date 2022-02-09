import fs from 'fs'
import path from 'path'
import semver from 'semver'

const raw = fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'))

export function assertNodeEngineVersion(currentVersion: string) {
  // None of this stuff will work on versions of Node older than v12
  const MIN_NODE_VERSION = 'v12'
  if (currentVersion < MIN_NODE_VERSION) {
    const message = `Cucumber can only run on Node.js versions ${MIN_NODE_VERSION} and greater. This Node.js version is ${currentVersion}`
    throw new Error(message)
  }
}
