import _ from 'lodash'
import ArgvParser from './argv_parser'
import fs from 'mz/fs'
import FeatureParser from './feature_parser'
import path from 'path'
import ProfileLoader from './profile_loader'
import Promise from 'bluebird'

export async function getExpandedArgv({ argv, cwd }) {
  let { options } = ArgvParser.parse(argv)
  let fullArgv = argv
  const profileArgv = await new ProfileLoader(cwd).getArgv(options.profile)
  if (profileArgv.length > 0) {
    fullArgv = _.concat(argv.slice(0, 2), profileArgv, argv.slice(2))
  }
  return fullArgv
}

export async function getFeatures({ cwd, featurePaths, scenarioFilter }) {
  const features = await Promise.map(featurePaths, async featurePath => {
    const source = await fs.readFile(featurePath, 'utf8')
    return FeatureParser.parse({
      scenarioFilter,
      source,
      uri: path.relative(cwd, featurePath)
    })
  })
  return _.chain(features)
    .compact()
    .filter(feature => feature.scenarios.length > 0)
    .value()
}
