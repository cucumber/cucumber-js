import { When } from '../../..'

When('a step throws an exception', function() {
  throw new Error('BOOM')
})
