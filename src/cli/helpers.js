import _ from 'lodash'
import ArgvParser from './argv_parser'
import fs from 'mz/fs'
import Gherkin from 'gherkin'
import path from 'path'
import ProfileLoader from './profile_loader'
import Promise from 'bluebird'
import PickleFilter from '../pickle_filter'

export async function getExpandedArgv({ argv, cwd }) {
  let { options } = ArgvParser.parse(argv)
  let fullArgv = argv
  const profileArgv = await new ProfileLoader(cwd).getArgv(options.profile)
  if (profileArgv.length > 0) {
    fullArgv = _.concat(argv.slice(0, 2), profileArgv, argv.slice(2))
  }
  return fullArgv
}

export async function getTestCases({
  cwd,
  eventBroadcaster,
  featurePaths,
  pickleFilterOptions
}) {
  const pickleFilter = new PickleFilter(pickleFilterOptions)
  const result = []
  await Promise.each(featurePaths, async featurePath => {
    const source = await fs.readFile(featurePath, 'utf8')
    const events = Gherkin.generateEvents(
      source,
      path.relative(cwd, featurePath)
    )
    events.forEach(event => {
      eventBroadcaster.emit(event.type, _.omit(event, 'type'))
      if (event.type === 'pickle') {
        const { pickle, uri } = event
        if (pickleFilter.matches({ pickle, uri })) {
          eventBroadcaster.emit('pickle-accepted', { pickle, uri })
          result.push({ pickle, uri })
        } else {
          eventBroadcaster.emit('pickle-rejected', { pickle, uri })
        }
      }
      if (event.type === 'attachment') {
        throw new Error(event.data)
      }
    })
  })
  return result
}
