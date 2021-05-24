import { Given } from '../../../src'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Given('{airport} is closed because of a strike', function (airport: any) {
  throw new Error('Should not be called because airport type not defined')
})
