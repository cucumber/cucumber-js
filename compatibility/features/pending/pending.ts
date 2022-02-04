import { Given } from '../../../src'

Given('an implemented step', function () {
  // no-op
})

Given('a step that isnt implemented yet', function () {
  return 'pending'
})

Given('a step that we expect to be skipped', function () {
  // no-op
})
