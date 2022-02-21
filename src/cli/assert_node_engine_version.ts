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
  onError: (message: string) => void,
  readPackageJSON: () => PackageJSON = readActualPackageJSON
): void {
  const requiredVersion = readPackageJSON().engines.node
  if (!semver.satisfies(currentVersion, requiredVersion)) {
    onError(`Cucumber can only run on Node.js versions ${requiredVersion}. This Node.js version is ${currentVersion}`)
  }
}
