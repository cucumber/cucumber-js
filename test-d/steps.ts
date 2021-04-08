import { Given, When, Then } from '../'

Given('some context', async function () {})

When('an action context', async function () {})

Then('verification', async function () {})

Given('a step that will be skipped', async function () {
  return 'skipped'
})

Given('a step that we need to implement', async function () {
  return 'pending'
})
