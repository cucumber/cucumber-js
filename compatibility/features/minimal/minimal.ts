import assert from 'assert'
import { Given } from '../../..'

Given('I have {int} cukes in my belly', function (cukeCount: number) {
  assert(cukeCount)
})
