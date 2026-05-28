import fs from 'node:fs'
import path from 'node:path'
import { After, Before, When } from '../../../src'

Before(async function () {
  await this.attach(
    fs.createReadStream(
      path.join(
        process.cwd(),
        'node_modules',
        '@cucumber',
        'compatibility-kit',
        'features',
        'hooks-attachment',
        'cucumber.svg'
      )
    ),
    'image/svg+xml'
  )
})

When('a step passes', () => {
  // no-op
})

After(async function () {
  await this.attach(
    fs.createReadStream(
      path.join(
        process.cwd(),
        'node_modules',
        '@cucumber',
        'compatibility-kit',
        'features',
        'hooks-attachment',
        'cucumber.svg'
      )
    ),
    'image/svg+xml'
  )
})
