import { expect } from 'chai'
import { promisify } from 'util'
import fs from 'fs'
import tmp, { DirOptions } from 'tmp'
import path from 'path'
import { fromFile } from './from_file'
import { FakeLogger } from '../../test/fake_logger'

async function setup(
  file: string = 'cucumber.js',
  content: string = `module.exports = {default: {paths: ['some/path/*.feature']}, p1: {paths: ['other/path/*.feature']}, p2: 'other/other/path/*.feature --no-strict'}`
) {
  const logger = new FakeLogger()
  const cwd = await promisify<DirOptions, string>(tmp.dir)({
    unsafeCleanup: true,
  })
  fs.writeFileSync(path.join(cwd, file), content, { encoding: 'utf-8' })
  return { logger, cwd }
}

describe('fromFile', () => {
  it('should return empty config if no default provide and no profiles requested', async () => {
    const { logger, cwd } = await setup(
      'cucumber.js',
      `module.exports = {p1: {paths: ['other/path/*.feature']}}`
    )

    const result = await fromFile(logger, cwd, 'cucumber.js', [])
    expect(result).to.deep.eq({})
  })

  it('should get default config from file if no profiles requested', async () => {
    const { logger, cwd } = await setup()

    const result = await fromFile(logger, cwd, 'cucumber.js', [])
    expect(result).to.deep.eq({ paths: ['some/path/*.feature'] })
  })

  it('should throw when a requested profile doesnt exist', async () => {
    const { logger, cwd } = await setup()

    try {
      await fromFile(logger, cwd, 'cucumber.js', ['nope'])
      expect.fail('should have thrown')
    } catch (error) {
      expect(error.message).to.eq(`Requested profile "nope" doesn't exist`)
    }
  })

  it('should get single profile config from file', async () => {
    const { logger, cwd } = await setup()

    const result = await fromFile(logger, cwd, 'cucumber.js', ['p1'])
    expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
  })

  it('should merge multiple profiles config from file', async () => {
    const { logger, cwd } = await setup()

    const result = await fromFile(logger, cwd, 'cucumber.js', ['p1', 'p2'])
    expect(result).to.deep.eq({
      paths: ['other/path/*.feature', 'other/other/path/*.feature'],
      strict: false,
    })
  })

  it('should throw when an object doesnt conform to the schema', async () => {
    const { logger, cwd } = await setup(
      'cucumber.js',
      `module.exports = {p1: {paths: 4, things: 8, requireModule: 'aardvark'}}`
    )
    try {
      await fromFile(logger, cwd, 'cucumber.js', ['p1'])
      expect.fail('should have thrown')
    } catch (error) {
      expect(error.message).to.eq(
        'Requested profile "p1" failed schema validation: paths must be a `array` type, but the final value was: `4`. requireModule must be a `array` type, but the final value was: `"aardvark"`.'
      )
    }
  })

  describe('other formats', () => {
    it('should work with esm', async () => {
      const { logger, cwd } = await setup(
        'cucumber.mjs',
        `export default {}; export const p1 = {paths: ['other/path/*.feature']}`
      )

      const result = await fromFile(logger, cwd, 'cucumber.mjs', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should work with json', async () => {
      const { logger, cwd } = await setup(
        'cucumber.json',
        `{ "default": {}, "p1": { "paths": ["other/path/*.feature"] } }`
      )

      const result = await fromFile(logger, cwd, 'cucumber.json', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should work with yaml', async () => {
      const { logger, cwd } = await setup(
        'cucumber.yaml',
        `default:

p1:
  paths:
    - "other/path/*.feature"
`
      )

      const result = await fromFile(logger, cwd, 'cucumber.yaml', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })
  })
})
