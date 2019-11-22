import _ from 'lodash'
import ArgvParser from './argv_parser'
import { fromPaths as gherkinFromPaths } from 'gherkin'
import ProfileLoader from './profile_loader'
import Promise from 'bluebird'
import shuffle from 'knuth-shuffle-seeded'
import path from 'path'
import { messages } from 'cucumber-messages'

export async function getExpandedArgv({ argv, cwd }) {
  const { options } = ArgvParser.parse(argv)
  let fullArgv = argv
  const profileArgv = await new ProfileLoader(cwd).getArgv(options.profile)
  if (profileArgv.length > 0) {
    fullArgv = _.concat(argv.slice(0, 2), profileArgv, argv.slice(2))
  }
  return fullArgv
}

export function getPicklesFromFilesystem({
  cwd,
  eventBroadcaster,
  featureDefaultLanguage,
  featurePaths,
  order,
  pickleFilter,
}) {
  return new Promise((resolve, reject) => {
    const result = []
    const messageStream = gherkinFromPaths(featurePaths, {
      defaultDialect: featureDefaultLanguage,
    })
    messageStream.on('data', envelope => {
      eventBroadcaster.emit('envelope', envelope)
      if (envelope.pickle) {
        const pickle = envelope.pickle
        const pickleId = pickle.id
        if (pickleFilter.matches(pickle)) {
          eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({ pickleAccepted: { pickleId } })
          )
          result.push(pickle)
        } else {
          eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({ pickleRejected: { pickleId } })
          )
        }
      }
      if (envelope.attachment) {
        reject(
          new Error(
            `Parse error in '${path.relative(
              cwd,
              envelope.attachment.source.uri
            )}': ${envelope.attachment.data}`
          )
        )
      }
    })
    messageStream.on('end', () => {
      orderPickles(result, order)
      resolve(result)
    })
    messageStream.on('error', reject)
  })
}

// Orders the testCases in place - morphs input
export function orderPickles(pickles, order) {
  let [type, seed] = order.split(':')
  switch (type) {
    case 'defined':
      break
    case 'random':
      if (!seed) {
        seed = Math.floor(Math.random() * 1000 * 1000).toString()
        console.warn(`Random order using seed: ${seed}`)
      }
      shuffle(pickles, seed)
      break
    default:
      throw new Error(
        'Unrecgonized order type. Should be `defined` or `random`'
      )
  }
}
