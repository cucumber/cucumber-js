import { expect } from 'chai'
import type { IRunEnvironment } from '../environment'
import { loadConfiguration } from './load_configuration'
import { setupEnvironment, teardownEnvironment } from './test_helpers'
import fs from 'node:fs/promises'
import path from 'node:path'

describe('loadConfiguration', function () {
  this.timeout(10_000)

  let environment: IRunEnvironment
  beforeEach(async () => {
    environment = await setupEnvironment()
  })
  afterEach(async () => teardownEnvironment(environment))

  it('should handle configuration directly provided as an array of strings', async () => {
    const { useConfiguration } = await loadConfiguration(
      { provided: ['--world-parameters', '{"foo":"bar"}'] },
      environment
    )

    expect(useConfiguration.worldParameters).to.deep.eq({ foo: 'bar' })
  })

  it('should handle configuration directly provided as a string', async () => {
    const { useConfiguration } = await loadConfiguration(
      { provided: `--world-parameters '{"foo":"bar"}'` },
      environment
    )

    expect(useConfiguration.worldParameters).to.deep.eq({ foo: 'bar' })
  })

  it('should skip trying to resolve from a file if `file=false`', async () => {
    const { useConfiguration } = await loadConfiguration({ file: false }, environment)

    // values from configuration file are not present
    expect(useConfiguration.paths).to.deep.eq([])
    expect(useConfiguration.requireModule).to.deep.eq([])
    expect(useConfiguration.require).to.deep.eq([])
  })

  it('should handle configuration from environment variables', async () => {
    environment.env = {
      CUCUMBER_PARALLEL: '4',
    }
    const { useConfiguration } = await loadConfiguration({}, environment)
    expect(useConfiguration.parallel).to.eq(4)
  })

  it('should allow provided configuration to override environment variables', async () => {
    environment.env = {
      CUCUMBER_PARALLEL: '4',
    }

    const { useConfiguration } = await loadConfiguration(
      {
        provided: ['--parallel', '8'],
      },
      environment
    )

    expect(useConfiguration.parallel).to.eq(8)
  })

  it('should allow environment variables to override configuration file', async () => {
    await fs.writeFile(path.join(environment.cwd!, 'cucumber.mjs'),
      `export default {
        paths: ['features/test.feature'],
        requireModule: ['tsx/cjs'],
        require: ['features/steps.ts'],
        parallel: 2
      }`
    )

    environment.env = {
      CUCUMBER_PARALLEL: '4',
    }

    const { useConfiguration } = await loadConfiguration({}, environment)

    expect(useConfiguration.parallel).to.eq(4)
  })
})
