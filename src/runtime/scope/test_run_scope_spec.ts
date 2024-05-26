import { expect } from 'chai'
import { contextProxy, runInTestRunScope } from './test_run_scope'

describe('testRunScope', () => {
  it('provides a proxy to the context that works when running a test run hook', async () => {
    const context = {
      parameters: {
        foo: 1,
        bar: 2,
      },
    }

    await runInTestRunScope({ context }, () => {
      // simple property access
      expect(contextProxy.parameters.foo).to.eq(1)
      contextProxy.parameters.foo = 'baz'
      expect(contextProxy.parameters.foo).to.eq('baz')
    })
  })
})
