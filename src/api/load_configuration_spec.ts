import { expect } from 'chai'
import type { IRunEnvironment } from '../environment'
import { loadConfiguration } from './load_configuration'
import { setupEnvironment, teardownEnvironment } from './test_helpers'

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

  describe('environment variables', () => {
    it('should source configuration from CUCUMBER_OPTION_ environment variables', async () => {
      const { useConfiguration } = await loadConfiguration(
        { file: false },
        { ...environment, env: { CUCUMBER_OPTION_DRY_RUN: 'true' } }
      )

      expect(useConfiguration.dryRun).to.eq(true)
    })

    it('should take precedence over the configuration file', async () => {
      const { useConfiguration } = await loadConfiguration(
        {},
        { ...environment, env: { CUCUMBER_OPTION_DRY_RUN: 'true' } }
      )

      // the config file (cucumber.mjs) does not set dryRun, so env wins over default
      expect(useConfiguration.dryRun).to.eq(true)
    })

    it('should be overridden by directly provided (CLI) configuration', async () => {
      const { useConfiguration } = await loadConfiguration(
        { file: false, provided: ['--no-strict'] },
        { ...environment, env: { CUCUMBER_OPTION_STRICT: 'true' } }
      )

      // CLI --no-strict wins over CUCUMBER_OPTION_STRICT=true
      expect(useConfiguration.strict).to.eq(false)
    })

    it('should merge with directly provided (CLI) values for additive options', async () => {
      const { useConfiguration } = await loadConfiguration(
        { file: false, provided: ['--tags', '@bar or @baz'] },
        { ...environment, env: { CUCUMBER_OPTION_TAGS: '@foo' } }
      )

      expect(useConfiguration.tags).to.eq('(@foo) and (@bar or @baz)')
    })
  })
})
