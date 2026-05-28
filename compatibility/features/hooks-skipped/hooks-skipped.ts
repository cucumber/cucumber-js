import { After, Before, When } from '../../../src'

Before({}, () => {
  // no-op
})

Before({ tags: '@skip-before' }, () => 'skipped')

Before({}, () => {
  // no-op
})

When('a normal step', () => {
  // no-op
})

When('a step that skips', () => 'skipped')

After({}, () => {
  // no-op
})

After({ tags: '@skip-after' }, () => 'skipped')

After({}, () => {
  // no-op
})
