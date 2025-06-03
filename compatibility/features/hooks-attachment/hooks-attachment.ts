import fs from 'node:fs'
import path from 'node:path'
import { Before, When, After } from '../../../src'

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

When('a step passes', function () {
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
