import fs from 'node:fs'
import path from 'node:path'
import semver from 'semver'

type PackageJSON = {
  engines: { node: string }
  enginesTested: { node: string }
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
  onWarning: (message: string) => void,
  readPackageJSON: () => PackageJSON = readActualPackageJSON
): void {
  const requiredVersions = readPackageJSON().engines.node
  const testedVersions = readPackageJSON().enginesTested.node
  if (!semver.satisfies(currentVersion, requiredVersions)) {
    onError(
      `Cucumber can only run on Node.js versions ${requiredVersions}. This Node.js version is ${currentVersion}`
    )
  } else if (!semver.satisfies(currentVersion, testedVersions)) {
    onWarning(
      `This Node.js version (${currentVersion}) has not been tested with this version of Cucumber; it should work normally, but please raise an issue if you see anything unexpected.`
    )
  }
}
