const assert = require('assert')
const { Given, When, Then } = require('../dist/cucumber')

Given(/^my number is (\d+)$/, (state, myNewNumber) => ({
  myNumber: myNewNumber,
}))

When(/^my number is multiplied by (\d+)$/, (state, multiplier) => ({
  myNumber: state.myNumber * multiplier,
}))

Then(/^my number should be (\d+)$/, (state, expectedNumber) =>
  assert.equal(state.myNumber, expectedNumber)
)
