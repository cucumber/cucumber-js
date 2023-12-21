import assert from 'node:assert'
import { Given, defineParameterType } from '../../../src'

class Flight {
  constructor(
    public readonly from: string,
    public readonly to: string
  ) {}
}

defineParameterType({
  name: 'flight',
  regexp: /([A-Z]{3})-([A-Z]{3})/,
  transformer(from: string, to: string) {
    return new Flight(from, to)
  },
})

Given('{flight} has been delayed', function (flight: Flight) {
  assert.strictEqual(flight.from, 'LHR')
  assert.strictEqual(flight.to, 'CDG')
})
