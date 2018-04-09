import _ from 'lodash'
import ArgvParser from './argv_parser'
import fs from 'mz/fs'
import Gherkin from 'gherkin'
import path from 'path'
import ProfileLoader from './profile_loader'
import Promise from 'bluebird'
import shuffle from 'knuth-shuffle-seeded'

export async function getExpandedArgv({ argv, cwd }) {
  const { options } = ArgvParser.parse(argv)
  let fullArgv = argv
  const profileArgv = await new ProfileLoader(cwd).getArgv(options.profile)
  if (profileArgv.length > 0) {
    fullArgv = _.concat(argv.slice(0, 2), profileArgv, argv.slice(2))
  }
  return fullArgv
}

export async function getTestCasesFromFilesystem({
  cwd,
  eventBroadcaster,
  featureDefaultLanguage,
  featurePaths,
  order,
  pickleFilter,
}) {
  let result = []
  await Promise.each(featurePaths, async featurePath => {
    const source = await fs.readFile(featurePath, 'utf8')
    result = result.concat(
      await getTestCases({
        eventBroadcaster,
        language: featureDefaultLanguage,
        source,
        pickleFilter,
        uri: path.relative(cwd, featurePath),
      })
    )
  })
  orderTestCases(result, order)
  return result
}

export async function getTestCases({
  eventBroadcaster,
  language,
  pickleFilter,
  source,
  uri,
}) {
  const result = []
  const events = Gherkin.generateEvents(source, uri, {}, language)
  events.forEach(event => {
    eventBroadcaster.emit(event.type, _.omit(event, 'type'))
    if (event.type === 'pickle') {
      const { pickle } = event
      if (pickleFilter.matches({ pickle, uri })) {
        eventBroadcaster.emit('pickle-accepted', { pickle, uri })
        result.push({ pickle, uri })
      } else {
        eventBroadcaster.emit('pickle-rejected', { pickle, uri })
      }
    }
    if (event.type === 'attachment') {
      throw new Error(`Parse error in '${uri}': ${event.data}`)
    }
  })
  return result
}

// Orders the testCases in place - morphs input
export function orderTestCases(testCases, order) {
  let [type, seed] = order.split(':')
  switch (type) {
    case 'defined':
      break
    case 'random':
      if (!seed) {
        seed = Math.floor(Math.random() * 1000 * 1000).toString()
        console.warn(`Random order using seed: ${seed}`)
      }
      shuffle(testCases, seed)
      break
    default:
      throw new Error(
        'Unrecgonized order type. Should be `defined` or `random`'
      )
  }
}
