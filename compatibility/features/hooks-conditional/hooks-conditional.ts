import { Before, When, After } from '../../../src'

Before('@passing-hook', async function () {
  // no-op
})

Before('@fail-before', function () {
  throw new Error('Exception in conditional hook')
})

When('a step passes', function () {
  // no-op
})

After('@fail-after', function () {
  throw new Error('Exception in conditional hook')
})

After('@passing-hook', async function () {
  // no-op
})
