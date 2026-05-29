import { AfterAll, BeforeAll, When } from '../../../src'

BeforeAll({}, () => {
  // no-op
})

BeforeAll({}, () => {
  throw new Error('BeforeAll hook went wrong')
})

BeforeAll({}, () => {
  // no-op
})

When('a step passes', () => {
  // no-op
})

AfterAll({}, () => {
  // no-op
})

AfterAll({}, () => {
  // no-op
})
