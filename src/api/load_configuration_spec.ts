import { expect } from 'chai'
import { IRunEnvironment } from './types'
import { setupEnvironment, teardownEnvironment } from './test_helpers'
import { loadConfiguration } from './load_configuration'

describe('loadConfiguration', function () {
  this.timeout(10_000)

  let environment: IRunEnvironment
  beforeEach(async () => {
    environment = await setupEnvironment()
  })
  afterEach(async () => teardownEnvironment(environment))

  it('should skip trying to resolve from a file if `file=false`', async () => {
    const { useConfiguration } = await loadConfiguration(
      { file: false },
      environment
    )

    // values from configuration file are not present
    expect(useConfiguration.paths).to.deep.eq([])
    expect(useConfiguration.requireModule).to.deep.eq([])
    expect(useConfiguration.require).to.deep.eq([])
  })
})
