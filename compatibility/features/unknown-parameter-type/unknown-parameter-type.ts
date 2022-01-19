import { Given } from '../../../src'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Given('{airport} is closed because of a strike', function (airport: unknown) {
  throw new Error('Should not be called because airport type not defined')
})
