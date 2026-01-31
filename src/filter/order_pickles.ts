import shuffle from 'knuth-shuffle-seeded'
import { ILogger } from '../environment'
import { IPickleOrder } from './types'

// Orders the pickleIds in place - morphs input
export function orderPickles<T = string>(
  pickleIds: T[],
  order: IPickleOrder,
  logger: ILogger
): void {
  const [type, seed] = splitOrder(order)
  switch (type) {
    case 'defined':
      break
    case 'reverse':
      pickleIds.reverse()
      break
    case 'random':
      if (seed === '') {
        const newSeed = Math.floor(Math.random() * 1000 * 1000).toString()
        logger.warn(`Random order using seed: ${newSeed}`)
        shuffle(pickleIds, newSeed)
      } else {
        shuffle(pickleIds, seed)
      }
      break
    default:
      throw new Error(
        'Unrecognized order type. Should be `defined` or `random`'
      )
  }
}

function splitOrder(order: string) {
  if (!order.includes(':')) {
    return [order, '']
  }
  return order.split(':')
}
