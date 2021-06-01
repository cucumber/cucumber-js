import { When } from '../../../src'

When('a step throws an exception', function () {
  throw new Error('BOOM')
})
