import assert from 'assert'
import { Given, When, Then } from '../../../src'

Given('there are {int} cucumbers', function (this: any, initialCount: number) {
  this.count = initialCount
})

When('I eat {int} cucumbers', function (this: any, eatCount: number) {
  this.count -= eatCount
})

Then(
  'I should have {int} cucumbers',
  function (this: any, expectedCount: number) {
    assert.strictEqual(this.count, expectedCount)
  }
)
