import { expect } from 'chai'
import * as sinon from 'sinon'
import { validateNodeEngineVersion } from './validate_node_engine_version'

describe(validateNodeEngineVersion.name, () => {
  it('returns an error message when the version is lower than any of our supported versions', () => {
    // Arrange
    const errorSpy = sinon.spy()

    // Act
    validateNodeEngineVersion('v11.1.2', errorSpy, () => ({
      engines: {
        node: '12 || 14 || 16 || 17',
      },
    }))

    // Assert
    expect(errorSpy).to.have.been.calledOnceWith(
      'Cucumber can only run on Node.js versions 12 || 14 || 16 || 17. This Node.js version is v11.1.2'
    )
  })

  it('returns an error message when the version is between our supported versions', () => {
    // Arrange
    const errorSpy = sinon.spy()

    // Act
    validateNodeEngineVersion('v13.1.2', errorSpy, () => ({
      engines: {
        node: '12 || 14 || 16 || 17',
      },
    }))

    // Assert
    expect(errorSpy).to.have.been.calledOnceWith(
      'Cucumber can only run on Node.js versions 12 || 14 || 16 || 17. This Node.js version is v13.1.2'
    )
  })

  it('returns null when the version is one of our supported versions', () => {
    // Arrange
    const errorSpy = sinon.spy()

    // Act
    validateNodeEngineVersion('v17.1.2', errorSpy, () => ({
      engines: {
        node: '12 || 14 || 16 || 17',
      },
    }))

    // Assert
    expect(errorSpy).not.to.have.been.called()
  })
})
