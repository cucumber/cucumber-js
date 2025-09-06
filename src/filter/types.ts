import { GherkinDocument, Location, Pickle } from '@cucumber/messages'

/**
 * The ordering strategy for pickles
 * @public
 * @example "defined"
 * @example "reverse"
 * @example "random"
 * @example "random:234119"
 */
export type IPickleOrder = 'defined' | 'reverse' | 'random' | `random:${string}`

export interface IFilterablePickle {
  pickle: Pickle
  gherkinDocument: GherkinDocument
  location: Location
}
