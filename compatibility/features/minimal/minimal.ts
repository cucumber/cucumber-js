import assert from 'node:assert'
import { Given } from '../../../src'

Given('I have {int} cukes in my belly', function (cukeCount: number) {
  assert(cukeCount)
})
