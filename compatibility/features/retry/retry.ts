import { Given } from '../../../src'

Given('a step that always passes', () => {
  // no-op
})

let secondTimePass = 0
Given('a step that passes the second time', () => {
  secondTimePass++
  if (secondTimePass < 2) {
    throw new Error('Exception in step')
  }
})

let thirdTimePass = 0
Given('a step that passes the third time', () => {
  thirdTimePass++
  if (thirdTimePass < 3) {
    throw new Error('Exception in step')
  }
})

Given('a step that always fails', () => {
  throw new Error('Exception in step')
})
