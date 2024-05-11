import sinon from 'sinon'
import { expect } from 'chai'
import World from '../../support_code_library_builder/world'
import { ICreateAttachment } from '../attachment_manager'
import { IFormatterLogFn } from '../../formatter'
import { runInTestCaseScope, worldProxy } from './test_case_scope'

describe('testCaseScope', () => {
  class CustomWorld extends World {
    firstNumber: number = 0
    secondNumber: number = 0

    get numbers() {
      return [this.firstNumber, this.secondNumber]
    }

    sum() {
      return this.firstNumber + this.secondNumber
    }
  }

  it('provides a proxy to the world that works when running a test case', async () => {
    const customWorld = new CustomWorld({
      attach: sinon.stub() as unknown as ICreateAttachment,
      log: sinon.stub() as IFormatterLogFn,
      parameters: {},
    })
    const customProxy = worldProxy as CustomWorld

    await runInTestCaseScope({ world: customWorld }, () => {
      // simple property access
      customProxy.firstNumber = 1
      customProxy.secondNumber = 2
      expect(customProxy.firstNumber).to.eq(1)
      expect(customProxy.secondNumber).to.eq(2)
      // getters using internal state
      expect(customProxy.numbers).to.deep.eq([1, 2])
      // instance methods using internal state
      expect(customProxy.sum()).to.eq(3)
      // enumeration
      expect(Object.keys(customProxy)).to.deep.eq([
        'attach',
        'log',
        'parameters',
        'firstNumber',
        'secondNumber',
      ])
    })
  })
})
