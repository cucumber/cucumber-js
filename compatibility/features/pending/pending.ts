import { Given } from '../../../src'

Given('an implemented non-pending step', () => {
  // no-op
})

Given('an implemented step that is skipped', () => {
  // no-op
})

Given('an unimplemented pending step', () => 'pending')
