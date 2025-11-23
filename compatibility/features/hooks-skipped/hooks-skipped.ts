import { After, Before, When } from '../../../src'

Before({}, function () {
  // no-op
})

Before({ tags: '@skip-before' }, function () {
  return 'skipped'
})

Before({}, function () {
  // no-op
})

When('a normal step', function () {
  // no-op
})

When('a step that skips', function () {
  return 'skipped'
})

After({}, function () {
  // no-op
})

After({ tags: '@skip-after' }, function () {
  return 'skipped'
})

After({}, function () {
  // no-op
})
