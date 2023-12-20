import { GherkinDocument, Location, Pickle } from '@cucumber/messages'

export interface IFilterablePickle {
  pickle: Pickle
  gherkinDocument: GherkinDocument
  location: Location
}
