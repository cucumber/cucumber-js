import _ from 'lodash'
import ArgvParser from './argv_parser'
import ProfileLoader from './profile_loader'
import shuffle from 'knuth-shuffle-seeded'
import path from 'path'
import { messages } from 'cucumber-messages'
import { EventEmitter } from 'events'
import PickleFilter from '../pickle_filter'
import { EventDataCollector } from '../formatter/helpers'
import { doesHaveValue } from '../value_checker'
import OptionSplitter from './option_splitter'
import { Readable } from 'stream'

export interface IGetExpandedArgvRequest {
  argv: string[]
  cwd: string
}

export async function getExpandedArgv({
  argv,
  cwd,
}: IGetExpandedArgvRequest): Promise<string[]> {
  const { options } = ArgvParser.parse(argv)
  let fullArgv = argv
  const profileArgv = await new ProfileLoader(cwd).getArgv(options.profile)
  if (profileArgv.length > 0) {
    fullArgv = _.concat(argv.slice(0, 2), profileArgv, argv.slice(2))
  }
  return fullArgv
}

interface IParseGherkinMessageStreamRequest {
  cwd: string
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  gherkinMessageStream: Readable
  order: string
  pickleFilter: PickleFilter
}

export async function parseGherkinMessageStream({
  cwd,
  eventBroadcaster,
  eventDataCollector,
  gherkinMessageStream,
  order,
  pickleFilter,
}: IParseGherkinMessageStreamRequest): Promise<string[]> {
  return await new Promise<string[]>((resolve, reject) => {
    const result: string[] = []
    gherkinMessageStream.on('data', (envelope: messages.IEnvelope) => {
      eventBroadcaster.emit('envelope', envelope)
      if (doesHaveValue(envelope.pickle)) {
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
      if (doesHaveValue(envelope.attachment)) {
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
    gherkinMessageStream.on('end', () => {
      orderPickleIds(result, order)
      resolve(result)
    })
    gherkinMessageStream.on('error', reject)
  })
}

// Orders the pickleIds in place - morphs input
export function orderPickleIds(pickleIds: string[], order: string): void {
  let [type, seed] = OptionSplitter.split(order)
  switch (type) {
    case 'defined':
      break
    case 'random':
      if (seed === '') {
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
