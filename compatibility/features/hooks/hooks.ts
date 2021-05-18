import { When, Before, After, World } from '../../../src'
import fs from 'fs'
import path from 'path'

Before(function () {
  // no-op
})

When('a step passes', function () {
  // no-op
})

When('a step throws an exception', function () {
  throw new Error('Exception in step')
})

After(function () {
  throw new Error('Exception in hook')
})

After('@some-tag or @some-other-tag', function () {
  throw new Error('Exception in conditional hook')
})

After('@with-attachment', async function (this: World) {
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
