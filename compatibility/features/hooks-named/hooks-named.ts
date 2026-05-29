import { After, Before, When } from '../../../src'

Before({ name: 'A named before hook' }, () => {
  // no-op
})

When('a step passes', () => {
  // no-op
})

After({ name: 'A named after hook' }, () => {
  // no-op
})
