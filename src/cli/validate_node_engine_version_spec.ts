import { expect } from 'chai'
import * as sinon from 'sinon'
import { validateNodeEngineVersion } from './validate_node_engine_version'

describe(validateNodeEngineVersion.name, () => {
  const readPackageJSON = () => ({
    engines: {
      node: '12 || 14 || >=16',
    },
    enginesTested: {
      node: '12 || 14 || 16 || 17',
    },
  })

  it('calls the onError callback when the version is lower than any of our supported versions', () => {
    // Arrange
    const errorSpy = sinon.spy()
    const warningSpy = sinon.spy()

    // Act
    validateNodeEngineVersion('v11.1.2', errorSpy, warningSpy, readPackageJSON)

    // Assert
    expect(errorSpy).to.have.been.calledOnceWith(
      'Cucumber can only run on Node.js versions 12 || 14 || >=16. This Node.js version is v11.1.2'
    )
    expect(warningSpy).not.to.have.been.called()
  })

  it('calls the onError callback when the version is between our supported versions', () => {
    // Arrange
    const errorSpy = sinon.spy()
    const warningSpy = sinon.spy()

    validateNodeEngineVersion('v13.1.2', errorSpy, warningSpy, readPackageJSON)

    // Assert
    expect(errorSpy).to.have.been.calledOnceWith(
      'Cucumber can only run on Node.js versions 12 || 14 || >=16. This Node.js version is v13.1.2'
    )
    expect(warningSpy).not.to.have.been.called()
  })

  it('does not call onError or onWarning when the version is one of our supported versions', () => {
    // Arrange
    const errorSpy = sinon.spy()
    const warningSpy = sinon.spy()

    // Act
    validateNodeEngineVersion('v17.1.2', errorSpy, warningSpy, readPackageJSON)

    // Assert
    expect(errorSpy).not.to.have.been.called()
    expect(warningSpy).not.to.have.been.called()
  })

  it('does not call onError when the version is a version that isnt out yet at time of release', () => {
    // Arrange
    const errorSpy = sinon.spy()
    const warningSpy = sinon.spy()

    // Act
    validateNodeEngineVersion('v18.0.0', errorSpy, warningSpy, readPackageJSON)

    // Assert
    expect(errorSpy).not.to.have.been.called()
    expect(warningSpy).to.have.been.calledOnceWith(
      `This Node.js version (v18.0.0) has not been tested with this version of Cucumber; it should work normally, but please raise an issue if you see anything unexpected.`
    )
  })
})
