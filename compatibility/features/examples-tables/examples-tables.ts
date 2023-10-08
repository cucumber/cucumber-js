import assert from 'node:assert'
import { Given, When, Then } from '../../../src'

type World = {
  count: number
}

Given(
  'there are {int} cucumbers',
  function (this: World, initialCount: number) {
    this.count = initialCount
  }
)

When('I eat {int} cucumbers', function (this: World, eatCount: number) {
  this.count -= eatCount
})

Then(
  'I should have {int} cucumbers',
  function (this: World, expectedCount: number) {
    assert.strictEqual(this.count, expectedCount)
  }
)
