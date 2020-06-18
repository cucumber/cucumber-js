import { describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { ParameterTypeRegistry } from 'cucumber-expressions'
import supportCodeLibraryBuilder from './'
import { IdGenerator } from 'cucumber-messages'
import { getPickleWithTags } from '../../test/gherkin_helpers'

const { uuid } = IdGenerator

describe('supportCodeLibraryBuilder', () => {
  describe('no support code fns', () => {
    it('returns the default options', function () {
      // Arrange
      const attachFn = sinon.stub()
      supportCodeLibraryBuilder.reset('path/to/project', uuid())

      // Act
      const options = supportCodeLibraryBuilder.finalize()

      // Assert
      expect(options.afterTestRunHookDefinitions).to.eql([])
      expect(options.afterTestCaseHookDefinitions).to.eql([])
      expect(options.beforeTestRunHookDefinitions).to.eql([])
      expect(options.beforeTestCaseHookDefinitions).to.eql([])
      expect(options.defaultTimeout).to.eql(5000)
      expect(options.stepDefinitions).to.eql([])
      expect(options.parameterTypeRegistry).to.be.instanceOf(
        ParameterTypeRegistry
      )
      const worldInstance = new options.World({
        attach: attachFn,
        parameters: { some: 'data' },
      })
      expect(worldInstance.attach).to.eql(attachFn)
      expect(worldInstance.parameters).to.eql({ some: 'data' })
    })
  })

  describe('step', () => {
    describe('without definition function wrapper', () => {
      it('adds a step definition and makes original code available', function () {
        // Arrange
        const step = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.defineStep('I do a thing', step)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.stepDefinitions).to.have.lengthOf(1)
        const stepDefinition = options.stepDefinitions[0]
        expect(stepDefinition.code).to.eql(step)
        expect(stepDefinition.unwrappedCode).to.eql(step)
      })
    })

    describe('with definition function wrapper', () => {
      it('adds a step definition and makes original code available', function () {
        // Arrange
        const step = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.defineStep('I do a thing', step)
        supportCodeLibraryBuilder.methods.setDefinitionFunctionWrapper(
          function (fn: Function) {
            return fn()
          }
        )

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.stepDefinitions).to.have.lengthOf(1)
        const stepDefinition = options.stepDefinitions[0]
        expect(stepDefinition.code).not.to.eql(step)
        expect(stepDefinition.unwrappedCode).to.eql(step)
      })
    })
  })

  describe('After', () => {
    describe('function only', () => {
      it('adds a test case hook definition', function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After(hook)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        const testCaseHookDefinition = options.afterTestCaseHookDefinitions[0]
        expect(testCaseHookDefinition.code).to.eql(hook)
      })
    })

    describe('tag and function', () => {
      it('adds a scenario hook definition', async function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After('@tagA', hook)
        const pickleWithTagA = await getPickleWithTags(['@tagA'])
        const pickleWithTagB = await getPickleWithTags(['@tagB'])

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        const testCaseHookDefinition = options.afterTestCaseHookDefinitions[0]
        expect(testCaseHookDefinition.code).to.eql(hook)
        expect(testCaseHookDefinition.appliesToTestCase(pickleWithTagA)).to.eql(
          true
        )
        expect(testCaseHookDefinition.appliesToTestCase(pickleWithTagB)).to.eql(
          false
        )
      })
    })

    describe('options and function', () => {
      it('adds a scenario hook definition', async function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After({ tags: '@tagA' }, hook)
        const pickleWithTagA = await getPickleWithTags(['@tagA'])
        const pickleWithTagB = await getPickleWithTags(['@tagB'])

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        const testCaseHookDefinition = options.afterTestCaseHookDefinitions[0]
        expect(testCaseHookDefinition.code).to.eql(hook)
        expect(testCaseHookDefinition.appliesToTestCase(pickleWithTagA)).to.eql(
          true
        )
        expect(testCaseHookDefinition.appliesToTestCase(pickleWithTagB)).to.eql(
          false
        )
      })
    })

    describe('multiple', () => {
      it('adds the scenario hook definitions in the reverse order of definition', function () {
        // Arrange
        const hook1 = function hook1(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        const hook2 = function hook2(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After(hook1)
        supportCodeLibraryBuilder.methods.After(hook2)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.afterTestCaseHookDefinitions).to.have.lengthOf(2)
        expect(options.afterTestCaseHookDefinitions[0].code).to.eql(hook2)
        expect(options.afterTestCaseHookDefinitions[1].code).to.eql(hook1)
      })
    })
  })

  describe('this.Before', () => {
    describe('function only', () => {
      it('adds a scenario hook definition', function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before(hook)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        const testCaseHookDefinition = options.beforeTestCaseHookDefinitions[0]
        expect(testCaseHookDefinition.code).to.eql(hook)
      })
    })

    describe('tag and function', () => {
      it('adds a scenario hook definition', async function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before('@tagA', hook)
        const pickleWithTagA = await getPickleWithTags(['@tagA'])
        const pickleWithTagB = await getPickleWithTags(['@tagB'])

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        const testCaseHookDefinition = options.beforeTestCaseHookDefinitions[0]
        expect(testCaseHookDefinition.code).to.eql(hook)
        expect(testCaseHookDefinition.appliesToTestCase(pickleWithTagA)).to.eql(
          true
        )
        expect(testCaseHookDefinition.appliesToTestCase(pickleWithTagB)).to.eql(
          false
        )
      })
    })

    describe('options and function', () => {
      it('adds a scenario hook definition', async function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before({ tags: '@tagA' }, hook)
        const pickleWithTagA = await getPickleWithTags(['@tagA'])
        const pickleWithTagB = await getPickleWithTags(['@tagB'])

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        const testCaseHookDefinition = options.beforeTestCaseHookDefinitions[0]
        expect(testCaseHookDefinition.code).to.eql(hook)
        expect(testCaseHookDefinition.appliesToTestCase(pickleWithTagA)).to.eql(
          true
        )
        expect(testCaseHookDefinition.appliesToTestCase(pickleWithTagB)).to.eql(
          false
        )
      })
    })

    describe('multiple', () => {
      it('adds the scenario hook definitions in the order of definition', function () {
        // Arrange
        const hook1 = function hook1(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        const hook2 = function hook2(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before(hook1)
        supportCodeLibraryBuilder.methods.Before(hook2)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.beforeTestCaseHookDefinitions).to.have.lengthOf(2)
        expect(options.beforeTestCaseHookDefinitions[0].code).to.eql(hook1)
        expect(options.beforeTestCaseHookDefinitions[1].code).to.eql(hook2)
      })
    })
  })
})
