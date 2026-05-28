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

/**
 * A Pickle decorated with relevant context that can be filtered or sorted
 * @public
 */
export interface IFilterablePickle {
  pickle: Pickle
  gherkinDocument: GherkinDocument
  location: Location
}
