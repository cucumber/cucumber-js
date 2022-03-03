import { expect } from 'chai'
import { promisify } from 'util'
import fs from 'fs'
import tmp, { DirOptions } from 'tmp'
import path from 'path'
import { fromFile } from './from_file'

async function setup(
  file: string = 'cucumber.js',
  content: string = `module.exports = {default: {paths: ['some/path/*.feature']}, p1: {paths: ['other/path/*.feature']}, p2: {paths: ['other/other/path/*.feature']}}`
) {
  const cwd = await promisify<DirOptions, string>(tmp.dir)({
    unsafeCleanup: true,
  })
  fs.writeFileSync(path.join(cwd, file), content, { encoding: 'utf-8' })
  return { cwd }
}

describe('fromFile', () => {
  it('should get default config from file if no profiles requested', async () => {
    const { cwd } = await setup()

    const result = await fromFile(cwd, 'cucumber.js', [])
    expect(result).to.deep.eq({ paths: ['some/path/*.feature'] })
  })

  it('should throw when a requested profile doesnt exist', async () => {
    const { cwd } = await setup()

    try {
      await fromFile(cwd, 'cucumber.js', ['nope'])
      expect.fail('should have thrown')
    } catch (error) {
      expect(error.message).to.eq(`Requested profile "nope" doesn't exist`)
    }
  })

  it('should get single profile config from file', async () => {
    const { cwd } = await setup()

    const result = await fromFile(cwd, 'cucumber.js', ['p1'])
    expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
  })

  it('should merge multiple profiles config from file', async () => {
    const { cwd } = await setup()

    const result = await fromFile(cwd, 'cucumber.js', ['p1', 'p2'])
    expect(result).to.deep.eq({
      paths: ['other/path/*.feature', 'other/other/path/*.feature'],
    })
  })
})
