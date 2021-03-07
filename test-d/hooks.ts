import { After, Before } from '../'

Before(async function () {
  return 'skipped'
})

After(async function () {
  return 'skipped'
})
