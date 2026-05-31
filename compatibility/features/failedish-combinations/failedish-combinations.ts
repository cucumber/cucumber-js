import { Given } from '../../../src'

Given(/^a step$/, () => {
  // no-op
})

Given(/^a skipped step$/, () => 'skipped')

Given(/^a pending step$/, () => 'pending')

Given(/^an ambiguous (.*?)$/, () => {})

Given(/^(.*?) ambiguous step$/, () => {})

Given(/^a failing step$/, () => {
  throw new Error('whoops')
})
