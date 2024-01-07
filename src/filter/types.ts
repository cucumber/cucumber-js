import { GherkinDocument, Location, Pickle } from '@cucumber/messages'

/**
 * The ordering strategy for pickles
 * @public
 * @example "defined"
 * @example "random"
 * @example "random:234119"
 */
export type IPickleOrder = 'defined' | 'random' | `random:${string}`

export interface IFilterablePickle {
  pickle: Pickle
  gherkinDocument: GherkinDocument
  location: Location
}
