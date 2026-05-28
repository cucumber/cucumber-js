import assert from 'node:assert'
import { Given } from '../../../src'

Given('I have {int} cukes in my belly', (cukeCount: number) => {
  assert(cukeCount)
})
