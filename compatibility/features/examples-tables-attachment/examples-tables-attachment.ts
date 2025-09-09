import fs from 'node:fs'
import path from 'node:path'
import { When } from '../../../src'

When('a JPEG image is attached', async function () {
  await this.attach(
    fs.createReadStream(
      path.join(
        process.cwd(),
        'node_modules',
        '@cucumber',
        'compatibility-kit',
        'features',
        'attachments',
        'cucumber.jpeg'
      )
    ),
    'image/jpeg'
  )
})

When('a PNG image is attached', async function () {
  await this.attach(
    fs.createReadStream(
      path.join(
        process.cwd(),
        'node_modules',
        '@cucumber',
        'compatibility-kit',
        'features',
        'attachments',
        'cucumber.png'
      )
    ),
    'image/png'
  )
})
