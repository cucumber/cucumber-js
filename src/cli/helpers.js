import _ from 'lodash'
import ArgvParser from './argv_parser'
import fs from 'mz/fs'
import FeatureParser from './feature_parser'
import ProfileLoader from './profile_loader'
import Promise from 'bluebird'


export async function getExpandedArgv({argv, cwd}) {
  let {options} = ArgvParser.parse(argv)
  let fullArgv = argv
  const profileArgv = await new ProfileLoader(cwd).getArgv(options.profile)
  if (profileArgv.length > 0) {
    fullArgv = _.concat(argv.slice(0, 2), profileArgv, argv.slice(2))
  }
  return fullArgv
}


export async function getFeatures(featurePaths) {
  return await Promise.map(featurePaths, async (featurePath) => {
    const source = await fs.readFile(featurePath, 'utf8')
    return FeatureParser.parse({source, uri: featurePath})
  })
}


export function getSupportCodeFunctions(supportCodePaths) {
  return _.chain(supportCodePaths)
    .map((codePath) => {
      const codeExport = require(codePath)
      if (typeof(codeExport) === 'function') {
        return codeExport
      } else if (codeExport && typeof(codeExport.default) === 'function') {
        return codeExport.default
      }
    })
    .compact()
    .value()
}
