import { When, BeforeAll, AfterAll } from '../../../src'

BeforeAll({}, function () {
  // no-op
})

BeforeAll({}, function () {
  throw new Error('BeforeAll hook went wrong')
})

BeforeAll({}, function () {
  // no-op
})

When('a step passes', function () {
  // no-op
})

AfterAll({}, function () {
  // no-op
})

AfterAll({}, function () {
  // no-op
})
