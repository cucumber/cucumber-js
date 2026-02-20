import { Before, When, After } from '../../../src'

Before({ name: 'A named before hook' }, function () {
  // no-op
})

When('a step passes', function () {
  // no-op
})

After({ name: 'A named after hook' }, function () {
  // no-op
})
