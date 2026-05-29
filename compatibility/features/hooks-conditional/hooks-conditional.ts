import { After, Before, When } from '../../../src'

Before('@passing-hook', async () => {
  // no-op
})

Before('@fail-before', () => {
  throw new Error('Exception in conditional hook')
})

When('a step passes', () => {
  // no-op
})

After('@fail-after', () => {
  throw new Error('Exception in conditional hook')
})

After('@passing-hook', async () => {
  // no-op
})
