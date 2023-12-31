import { GherkinDocument, Location, Pickle } from '@cucumber/messages'

/**
 * The ordering strategy for pickles
 *
 * @public
 */
export type IPickleOrder = 'defined' | 'random' | string

export interface IFilterablePickle {
  pickle: Pickle
  gherkinDocument: GherkinDocument
  location: Location
}
