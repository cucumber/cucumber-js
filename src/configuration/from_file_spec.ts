import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import tmp, { DirOptions } from 'tmp'
import { expect } from 'chai'
import { FakeLogger } from '../../test/fake_logger'
import { fromFile } from './from_file'

async function setup(
  file: string = 'cucumber.json',
  content: string = JSON.stringify({
    default: { paths: ['some/path/*.feature'] },
    p1: { paths: ['other/path/*.feature'] },
    p2: 'other/other/path/*.feature --no-strict',
  }),
  packageJson: string = `{}`
) {
  const logger = new FakeLogger()
  const cwd = await promisify<DirOptions, string>(tmp.dir)({
    unsafeCleanup: true,
  })
  fs.writeFileSync(path.join(cwd, file), content, { encoding: 'utf-8' })
  fs.writeFileSync(path.join(cwd, 'package.json'), packageJson, {
    encoding: 'utf-8',
  })
  return { logger, cwd }
}

describe('fromFile', () => {
  it('should return empty config if no default provide and no profiles requested', async () => {
    const { logger, cwd } = await setup(
      'cucumber.json',
      JSON.stringify({ p1: { paths: ['other/path/*.feature'] } })
    )

    const result = await fromFile(logger, cwd, 'cucumber.json', [])
    expect(result).to.deep.eq({})
  })

  it('should get default config from file if no profiles requested', async () => {
    const { logger, cwd } = await setup()

    const result = await fromFile(logger, cwd, 'cucumber.json', [])
    expect(result).to.deep.eq({ paths: ['some/path/*.feature'] })
  })

  it('should throw when a requested profile doesnt exist', async () => {
    const { logger, cwd } = await setup()

    try {
      await fromFile(logger, cwd, 'cucumber.json', ['nope'])
      expect.fail('should have thrown')
    } catch (error) {
      expect(error.message).to.eq(`Requested profile "nope" doesn't exist`)
    }
  })

  it('should get single profile config from file', async () => {
    const { logger, cwd } = await setup()

    const result = await fromFile(logger, cwd, 'cucumber.json', ['p1'])
    expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
  })

  it('should merge multiple profiles config from file', async () => {
    const { logger, cwd } = await setup()

    const result = await fromFile(logger, cwd, 'cucumber.json', ['p1', 'p2'])
    expect(result).to.deep.eq({
      paths: ['other/path/*.feature', 'other/other/path/*.feature'],
      strict: false,
    })
  })

  it('should throw when an object doesnt conform to the schema', async () => {
    const { logger, cwd } = await setup(
      'cucumber.json',
      JSON.stringify({ p1: { paths: 4, things: 8, requireModule: 'aardvark' } })
    )
    try {
      await fromFile(logger, cwd, 'cucumber.json', ['p1'])
      expect.fail('should have thrown')
    } catch (error) {
      expect(error.message).to.eq(
        'Profile "p1" configuration value failed schema validation: paths must be a `array` type, but the final value was: `4`. requireModule must be a `array` type, but the final value was: `"aardvark"`.'
      )
    }
  })

  describe('supported formats', () => {
    it('should work with .mjs', async () => {
      const { logger, cwd } = await setup(
        'cucumber.mjs',
        `export default {}; export const p1 = {paths: ['other/path/*.feature']}`
      )

      const result = await fromFile(logger, cwd, 'cucumber.mjs', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should work with .mjs with default function', async () => {
      const { logger, cwd } = await setup(
        'cucumber.mjs',
        `export default async function() { 
          return {
            default: { paths: ['default/path/*.feature'] },
            p1: { paths: ['p1/path/*.feature'] }
          };
        };`
      )

      const defaultResult = await fromFile(logger, cwd, 'cucumber.mjs', [
        'default',
      ])
      expect(defaultResult).to.deep.eq({ paths: ['default/path/*.feature'] })
    })

    it('should throw with .mjs with default function and additional static profiles', async () => {
      const { logger, cwd } = await setup(
        'cucumber.mjs',
        `export default async function() { 
          return {
            default: { paths: ['default/path/*.feature'] },
            p1: { paths: ['p1/path/*.feature'] }
          };
        };
        export const p1 = { paths: ['other/p1/path/*.feature'] };
        export const p2 = { paths: ['p2/path/*.feature'] };`
      )

      try {
        await fromFile(logger, cwd, 'cucumber.mjs', ['default'])
        expect.fail('should have thrown')
      } catch (error) {
        expect(error.message).to.eq(
          'Invalid profiles specified: if a default function definition is provided, no other static profiles should be specified'
        )
      }
    })

    it('should work with .cjs', async () => {
      const { logger, cwd } = await setup(
        'cucumber.cjs',
        `module.exports = { default: {}, p1: { paths: ['other/path/*.feature'] } }`
      )

      const result = await fromFile(logger, cwd, 'cucumber.cjs', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should work with .js when commonjs (undeclared)', async () => {
      const { logger, cwd } = await setup(
        'cucumber.js',
        `module.exports = { default: {}, p1: { paths: ['other/path/*.feature'] } }`
      )

      const result = await fromFile(logger, cwd, 'cucumber.js', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should work with .js when commonjs (explicit)', async () => {
      const { logger, cwd } = await setup(
        'cucumber.js',
        `module.exports = { default: {}, p1: { paths: ['other/path/*.feature'] } }`,
        JSON.stringify({ type: 'commonjs' })
      )

      const result = await fromFile(logger, cwd, 'cucumber.js', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should work with .js when module (explicit)', async () => {
      const { logger, cwd } = await setup(
        'cucumber.js',
        `export default {}; export const p1 = {paths: ['other/path/*.feature']}`,
        JSON.stringify({ type: 'module' })
      )

      const result = await fromFile(logger, cwd, 'cucumber.js', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should work with .json', async () => {
      const { logger, cwd } = await setup(
        'cucumber.json',
        `{ "default": {}, "p1": { "paths": ["other/path/*.feature"] } }`
      )

      const result = await fromFile(logger, cwd, 'cucumber.json', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should work with .yaml', async () => {
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

    it('should work with .yml', async () => {
      const { logger, cwd } = await setup(
        'cucumber.yml',
        `default:

p1:
  paths:
    - "other/path/*.feature"
`
      )

      const result = await fromFile(logger, cwd, 'cucumber.yml', ['p1'])
      expect(result).to.deep.eq({ paths: ['other/path/*.feature'] })
    })

    it('should throw for an unsupported format', async () => {
      const { logger, cwd } = await setup('cucumber.foo', `{}`)
      try {
        await fromFile(logger, cwd, 'cucumber.foo', ['p1'])
        expect.fail('should have thrown')
      } catch (error) {
        expect(error.message).to.eq(
          'Unsupported configuration file extension ".foo"'
        )
      }
    })
  })
})
