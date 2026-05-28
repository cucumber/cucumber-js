import { Given, Then, When } from '../'

Given('some context', async () => {})

When('an action context', async () => {})

Then('verification', async () => {})

Given('a step that will be skipped', async () => 'skipped')

Given('a step that we need to implement', async () => 'pending')
