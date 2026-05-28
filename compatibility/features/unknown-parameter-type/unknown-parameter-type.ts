import { Given } from '../../../src'

Given('{airport} is closed because of a strike', (_airport: unknown) => {
  throw new Error('Should not be called because airport type not defined')
})
