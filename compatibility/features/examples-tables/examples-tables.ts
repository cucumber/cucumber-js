import assert from 'node:assert'
import { Given, When, Then } from '../../../src'

Given('there are {int} cucumbers', function (initialCount: number) {
  this.count = initialCount
})

Given('there are {int} friends', function (initialFriends: number) {
  this.friends = initialFriends
})

When('I eat {int} cucumbers', function (eatCount: number) {
  this.count -= eatCount
})

Then('I should have {int} cucumbers', function (expectedCount: number) {
  assert.strictEqual(this.count, expectedCount)
})

Then('each person can eat {int} cucumbers', function (expectedShare) {
  const share = Math.floor(this.count / (1 + this.friends))
  assert.strictEqual(share, expectedShare)
})
