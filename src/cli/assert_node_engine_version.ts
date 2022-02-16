import fs from 'fs'
import path from 'path'
import semver from 'semver'

type PackageJSON = {
  engines: { node: string }
}

const readActualPackageJSON: () => PackageJSON = () =>
  JSON.parse(
    fs
      .readFileSync(path.resolve(__dirname, '..', '..', 'package.json'))
      .toString()
  )

export function validateNodeEngineVersion(
  currentVersion: string,
  readPackageJSON: () => PackageJSON = readActualPackageJSON
): string {
  const requiredVersion = readPackageJSON().engines.node
  if (!semver.satisfies(currentVersion, requiredVersion)) {
    return `Cucumber can only run on Node.js versions ${requiredVersion}. This Node.js version is ${currentVersion}`
  }
  return null
}
