import fs from 'node:fs'
import path from 'node:path'
import { When, Before, After } from '../../../src'

Before(function () {
  // no-op
})

Before({ name: 'A named hook' }, function () {
  // no-op
})

When('a step passes', function () {
  // no-op
})

When('a step fails', function () {
  throw new Error('Exception in step')
})

After(function () {
  // no-op
})

After('@some-tag or @some-other-tag', function () {
  throw new Error('Exception in conditional hook')
})

After('@with-attachment', async function () {
  await this.attach(
    fs.createReadStream(
      path.join(
        process.cwd(),
        'node_modules',
        '@cucumber',
        'compatibility-kit',
        'features',
        'hooks',
        'cucumber.svg'
      )
    ),
    'image/svg+xml'
  )
})
