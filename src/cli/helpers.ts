import _ from 'lodash'
import ArgvParser from './argv_parser'
import Gherkin from 'gherkin'
import ProfileLoader from './profile_loader'
import shuffle from 'knuth-shuffle-seeded'
import path from 'path'
import { messages, IdGenerator } from 'cucumber-messages'
import { EventEmitter } from 'events'
import PickleFilter from '../pickle_filter'
import { EventDataCollector } from '../formatter/helpers'

export async function getExpandedArgv({ argv, cwd }) {
  const { options } = ArgvParser.parse(argv)
  let fullArgv = argv
  const profileArgv = await new ProfileLoader(cwd).getArgv(options.profile)
  if (profileArgv.length > 0) {
    fullArgv = _.concat(argv.slice(0, 2), profileArgv, argv.slice(2))
  }
  return fullArgv
}

interface ILoadPicklesFromFilesystemOptions {
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  featureDefaultLanguage: string
  featurePaths: string[]
  newId: IdGenerator.NewId
  order: string
  pickleFilter: PickleFilter
}

// Returns ordered list of pickleIds to run
export function loadPicklesFromFilesystem({
  cwd,
  eventBroadcaster,
  eventDataCollector,
  featureDefaultLanguage,
  featurePaths,
  newId,
  order,
  pickleFilter,
}: ILoadPicklesFromFilesystemOptions): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const result = []
    const messageStream = Gherkin.fromPaths(featurePaths, {
      defaultDialect: featureDefaultLanguage,
      newId,
    })
    messageStream.on('data', envelope => {
      eventBroadcaster.emit('envelope', envelope)
      if (envelope.pickle) {
        const pickle = envelope.pickle
        const pickleId = pickle.id
        const gherkinDocument = eventDataCollector.getGherkinDocument(
          pickle.uri
        )
        if (pickleFilter.matches({ gherkinDocument, pickle })) {
          eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({ pickleAccepted: { pickleId } })
          )
          result.push(pickleId)
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
      orderPickleIds(result, order)
      resolve(result)
    })
    messageStream.on('error', reject)
  })
}

// Orders the pickleIds in place - morphs input
export function orderPickleIds(pickleIds, order) {
  let [type, seed] = order.split(':')
  switch (type) {
    case 'defined':
      break
    case 'random':
      if (!seed) {
        seed = Math.floor(Math.random() * 1000 * 1000).toString()
        console.warn(`Random order using seed: ${seed}`)
      }
      shuffle(pickleIds, seed)
      break
    default:
      throw new Error(
        'Unrecgonized order type. Should be `defined` or `random`'
      )
  }
}
