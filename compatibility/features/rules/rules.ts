import assert from 'assert'
import { Given, When, Then } from '../../../src'

Given(
  'there are {int} {float} coins inside',
  function (count: number, denomination: number) {
    // TODO: implement this
    assert(count)
    assert(denomination)
  }
)

Given('there are no chocolates inside', function () {
  // TODO: implement this
})

Given('there are {int} chocolates inside', function (chocolateCount: number) {
  // TODO: implement this
  assert(chocolateCount)
})

When(
  'the customer tries to buy a {float} chocolate with a {float} coin',
  function (price: number, paid: number) {
    // TODO: implement this
    assert(price)
    assert(paid)
  }
)

Then('the sale should not happen', function () {
  // TODO: implement this
})

Then(
  "the customer's change should be {int} {float} coin(s)",
  function (count: number, denomination: number) {
    // TODO: implement this
    assert(count)
    assert(denomination)
  }
)
