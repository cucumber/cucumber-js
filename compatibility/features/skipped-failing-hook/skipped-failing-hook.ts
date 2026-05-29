import { After, Given } from '../../../src'

Given('a step that skips', () => 'skipped')

After(() => {
  throw new Error('whoops')
})
