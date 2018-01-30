const assert = require('assert')
const { After, Before, Given, When, Then } = require('../lib')

class State {
  constructor(props = {}) {
    Object.keys(props).forEach(key => {
      this[key] = props[key]
    })
  }

  with(props) {
    return new State(Object.assign({}, this, props))
  }
}

Before(() => new State())

After((state, res) => {
  if (res.result.status === 'failed')
    console.log(
      `--- FAILED SCENARIO LAST STATE (${res.sourceLocation.uri}:${res
        .sourceLocation.line}) ---\n${JSON.stringify(state, null, 2)}`
    )
})

Given(/^my number is (\d+)$/, (state, myNewNumber) =>
  state.with({
    myNumber: myNewNumber,
  })
)

When(/^my number is multiplied by (\d+)$/, (state, multiplier) =>
  state.with({
    myNumber: state.myNumber * multiplier,
  })
)

When('my number is divided by {int}', (state, divider) =>
  state.with({
    myNumber: Math.floor(state.myNumber / divider),
    myRemainder: state.myNumber % divider,
  })
)

Then(/^my number should be (\d+)$/, (state, expectedNumber) =>
  assert.equal(state.myNumber, expectedNumber)
)

Then(/^my number should not be (\d+)$/, (state, unexpectedNumber) =>
  assert.notEqual(state.myNumber, unexpectedNumber)
)

Then('my remainder should be {int}', (state, expectedRemainder) =>
  assert.equal(state.myRemainder, expectedRemainder)
)
