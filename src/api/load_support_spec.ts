import path from 'node:path'
import { expect } from 'chai'
import { IRunEnvironment } from './types'
import { loadSupport } from './load_support'
import { loadConfiguration } from './load_configuration'
import { setupEnvironment, teardownEnvironment } from './test_helpers'

describe('loadSupport', function () {
  this.timeout(10_000)

  let environment: IRunEnvironment
  beforeEach(async () => {
    environment = await setupEnvironment()
  })
  afterEach(async () => teardownEnvironment(environment))

  it('should include original paths in the returned support code library', async () => {
    const { runConfiguration } = await loadConfiguration({}, environment)
    const support = await loadSupport(runConfiguration, environment)

    expect(support.originalCoordinates).to.deep.eq({
      requireModules: ['ts-node/register'],
      requirePaths: [path.join(environment.cwd, 'features', 'steps.ts')],
      importPaths: [],
      loaders: [],
    })
  })
})
