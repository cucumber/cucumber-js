import assert from 'assert'
import { expect } from 'chai'
import { validateNodeEngineVersion } from './assert_node_engine_version'

describe(validateNodeEngineVersion.name, () => {
  it('returns an error message when the version is lower than specified in package.json', () => {
    // Arrange

    // Act
    const error = validateNodeEngineVersion('v11.0.0', () => ({
      engines: {
        node: '>=12',
      },
    }))

    // Assert
    expect(error).to.eql(
      'Cucumber can only run on Node.js versions >=12. This Node.js version is v11.0.0'
    )
  })

  it('returns null when the version is greater than specified in package.json', () => {
    // Arrange

    // Act
    const result = validateNodeEngineVersion('v17.0.0', () => ({
      engines: {
        node: '>=12',
      },
    }))

    // Assert
    expect(result).to.eql(null)
  })
})
