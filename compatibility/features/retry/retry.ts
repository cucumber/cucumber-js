import { Given } from '../../../src'

Given('a step that always passes', function () {
  // no-op
})

let secondTimePass = 0
Given('a step that passes the second time', function () {
  secondTimePass++
  if (secondTimePass < 2) {
    throw new Error('Exception in step')
  }
})

let thirdTimePass = 0
Given('a step that passes the third time', function () {
  thirdTimePass++
  if (thirdTimePass < 3) {
    throw new Error('Exception in step')
  }
})

Given('a step that always fails', function () {
  throw new Error('Exception in step')
})
