import { fail } from 'node:assert'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import { IdGenerator } from '@cucumber/messages'
import { getPickleWithTags } from '../../test/gherkin_helpers'
import supportCodeLibraryBuilder from './'

const { uuid } = IdGenerator

describe('supportCodeLibraryBuilder', () => {
  it('should throw if not been reset yet', () => {
    try {
      // @ts-expect-error mutating private member
      supportCodeLibraryBuilder.status = 'PENDING'
      supportCodeLibraryBuilder.methods.Given('some context', () => {})
      fail()
    } catch (e) {
      expect(e.message).to.contain('calling functions (e.g. "Given")')
      expect(e.message).to.contain('status: PENDING')
    }
  })

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

      it('uses the canonical ids provided in order', function () {
        // Arrange
        const step = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.defineStep('I do a thing', step)
        supportCodeLibraryBuilder.methods.defineStep('I do another thing', step)

        // Act
        const options = supportCodeLibraryBuilder.finalize({
          stepDefinitionIds: ['one', 'two'],
          beforeTestCaseHookDefinitionIds: [],
          afterTestCaseHookDefinitionIds: [],
        })

        // Assert
        expect(options.stepDefinitions).to.have.lengthOf(2)
        expect(
          options.stepDefinitions.map((stepDefinition) => stepDefinition.id)
        ).to.deep.eq(['one', 'two'])
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

    describe('keyword retention', () => {
      const step = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function

      beforeEach(() =>
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
      )

      it('should record correctly for Given', () => {
        supportCodeLibraryBuilder.methods.Given('a thing', step)
        expect(
          supportCodeLibraryBuilder.finalize().stepDefinitions[0].keyword
        ).to.eq('Given')
      })

      it('should record correctly for When', () => {
        supportCodeLibraryBuilder.methods.When('a thing', step)
        expect(
          supportCodeLibraryBuilder.finalize().stepDefinitions[0].keyword
        ).to.eq('When')
      })

      it('should record correctly for Then', () => {
        supportCodeLibraryBuilder.methods.Then('a thing', step)
        expect(
          supportCodeLibraryBuilder.finalize().stepDefinitions[0].keyword
        ).to.eq('Then')
      })

      it('should record correctly for defineStep', () => {
        supportCodeLibraryBuilder.methods.defineStep('a thing', step)
        expect(
          supportCodeLibraryBuilder.finalize().stepDefinitions[0].keyword
        ).to.eq('Unknown')
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

      it('uses the canonical ids provided in order', function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After(hook)
        supportCodeLibraryBuilder.methods.After(hook)

        // Act
        const options = supportCodeLibraryBuilder.finalize({
          stepDefinitionIds: [],
          beforeTestCaseHookDefinitionIds: [],
          afterTestCaseHookDefinitionIds: ['one', 'two'],
        })

        // Assert
        expect(options.afterTestCaseHookDefinitions).to.have.lengthOf(2)
        expect(
          options.afterTestCaseHookDefinitions.map(
            (definition) => definition.id
          )
        ).to.deep.eq(['one', 'two'])
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
      it('adds the scenario hook definitions in the order of definition', function () {
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
        expect(options.afterTestCaseHookDefinitions[0].code).to.eql(hook1)
        expect(options.afterTestCaseHookDefinitions[1].code).to.eql(hook2)
      })
    })
  })

  describe('Before', () => {
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

      it('uses the canonical ids provided in order', function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before(hook)
        supportCodeLibraryBuilder.methods.Before(hook)

        // Act
        const options = supportCodeLibraryBuilder.finalize({
          stepDefinitionIds: [],
          beforeTestCaseHookDefinitionIds: ['one', 'two'],
          afterTestCaseHookDefinitionIds: [],
        })

        // Assert
        expect(options.beforeTestCaseHookDefinitions).to.have.lengthOf(2)
        expect(
          options.beforeTestCaseHookDefinitions.map(
            (definition) => definition.id
          )
        ).to.deep.eq(['one', 'two'])
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

  describe('AfterStep', () => {
    describe('function only', () => {
      it('adds a test step hook definition', function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.AfterStep(hook)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.afterTestStepHookDefinitions).to.have.lengthOf(1)
        const testStepHookDefinition = options.afterTestStepHookDefinitions[0]
        expect(testStepHookDefinition.code).to.eql(hook)
      })
    })

    describe('tag and function', () => {
      it('adds a step hook definition', async function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.AfterStep('@tagA', hook)
        const pickleWithTagA = await getPickleWithTags(['@tagA'])
        const pickleWithTagB = await getPickleWithTags(['@tagB'])

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.afterTestStepHookDefinitions).to.have.lengthOf(1)
        const testStepHookDefinition = options.afterTestStepHookDefinitions[0]
        expect(testStepHookDefinition.code).to.eql(hook)
        expect(testStepHookDefinition.appliesToTestCase(pickleWithTagA)).to.eql(
          true
        )
        expect(testStepHookDefinition.appliesToTestCase(pickleWithTagB)).to.eql(
          false
        )
      })
    })

    describe('options and function', () => {
      it('adds a step hook definition', async function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.AfterStep({ tags: '@tagA' }, hook)
        const pickleWithTagA = await getPickleWithTags(['@tagA'])
        const pickleWithTagB = await getPickleWithTags(['@tagB'])

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.afterTestStepHookDefinitions).to.have.lengthOf(1)
        const testStepHookDefinition = options.afterTestStepHookDefinitions[0]
        expect(testStepHookDefinition.code).to.eql(hook)
        expect(testStepHookDefinition.appliesToTestCase(pickleWithTagA)).to.eql(
          true
        )
        expect(testStepHookDefinition.appliesToTestCase(pickleWithTagB)).to.eql(
          false
        )
      })
    })

    describe('multiple', () => {
      it('adds the step hook definitions in the order of definition', function () {
        // Arrange
        const hook1 = function hook1(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        const hook2 = function hook2(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.AfterStep(hook1)
        supportCodeLibraryBuilder.methods.AfterStep(hook2)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.afterTestStepHookDefinitions).to.have.lengthOf(2)
        expect(options.afterTestStepHookDefinitions[0].code).to.eql(hook1)
        expect(options.afterTestStepHookDefinitions[1].code).to.eql(hook2)
      })
    })
  })

  describe('BeforeStep', () => {
    describe('function only', () => {
      it('adds a step hook definition', function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.BeforeStep(hook)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.beforeTestStepHookDefinitions).to.have.lengthOf(1)
        const testStepHookDefinition = options.beforeTestStepHookDefinitions[0]
        expect(testStepHookDefinition.code).to.eql(hook)
      })
    })

    describe('tag and function', () => {
      it('adds a step hook definition', async function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.BeforeStep('@tagA', hook)
        const pickleWithTagA = await getPickleWithTags(['@tagA'])
        const pickleWithTagB = await getPickleWithTags(['@tagB'])

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.beforeTestStepHookDefinitions).to.have.lengthOf(1)
        const testStepHookDefinition = options.beforeTestStepHookDefinitions[0]
        expect(testStepHookDefinition.code).to.eql(hook)
        expect(testStepHookDefinition.appliesToTestCase(pickleWithTagA)).to.eql(
          true
        )
        expect(testStepHookDefinition.appliesToTestCase(pickleWithTagB)).to.eql(
          false
        )
      })
    })

    describe('options and function', () => {
      it('adds a step hook definition', async function () {
        // Arrange
        const hook = function (): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.BeforeStep({ tags: '@tagA' }, hook)
        const pickleWithTagA = await getPickleWithTags(['@tagA'])
        const pickleWithTagB = await getPickleWithTags(['@tagB'])

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.beforeTestStepHookDefinitions).to.have.lengthOf(1)
        const testStepHookDefinition = options.beforeTestStepHookDefinitions[0]
        expect(testStepHookDefinition.code).to.eql(hook)
        expect(testStepHookDefinition.appliesToTestCase(pickleWithTagA)).to.eql(
          true
        )
        expect(testStepHookDefinition.appliesToTestCase(pickleWithTagB)).to.eql(
          false
        )
      })
    })

    describe('multiple', () => {
      it('adds the step hook definitions in the order of definition', function () {
        // Arrange
        const hook1 = function hook1(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        const hook2 = function hook2(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.BeforeStep(hook1)
        supportCodeLibraryBuilder.methods.BeforeStep(hook2)

        // Act
        const options = supportCodeLibraryBuilder.finalize()

        // Assert
        expect(options.beforeTestStepHookDefinitions).to.have.lengthOf(2)
        expect(options.beforeTestStepHookDefinitions[0].code).to.eql(hook1)
        expect(options.beforeTestStepHookDefinitions[1].code).to.eql(hook2)
      })
    })
  })
})
