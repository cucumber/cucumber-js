import { When, BeforeAll, AfterAll } from '../../../src'

BeforeAll({}, function () {
  // no-op
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
  throw new Error('AfterAll hook went wrong')
})

AfterAll({}, function () {
  // no-op
})
