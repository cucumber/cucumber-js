import { When } from '../../../src'

When('a step throws an exception', () => {
  throw new Error('BOOM')
})
