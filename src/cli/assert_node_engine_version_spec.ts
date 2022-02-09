import assert from 'assert'
import { assertNodeEngineVersion } from './assert_node_engine_version'

describe(assertNodeEngineVersion.name, () => {
  it('fails when the version is lower than specified in package.json', () => {
    assert.throws(() => assertNodeEngineVersion('v11.0.0'))
  })

  it('passes when the version is greater than specified in package.json', () => {
    assertNodeEngineVersion('v17.0.0')
  })
})
