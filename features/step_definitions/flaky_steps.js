import { Given, Then } from '../../lib'

let isFlaky = true

Given('I run a flaky test', function() {
  this.lastRun = {}
})

Then('the the flaky step may fail', function() {
  if (isFlaky) {
    isFlaky = false
    throw new Error('Flaky step')
  }
})
