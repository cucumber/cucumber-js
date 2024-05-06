import { AsyncLocalStorage } from 'node:async_hooks'
import { IWorld } from '../../support_code_library_builder/world'

interface TestCaseScopeStore<ParametersType = any> {
  world: IWorld<ParametersType>
}

const testCaseScope = new AsyncLocalStorage<TestCaseScopeStore>()

export async function runInTestCaseScope<ResponseType>(
  store: TestCaseScopeStore,
  callback: () => ResponseType
) {
  return testCaseScope.run(store, callback)
}

/**
 * Retrieve the World for the currently executing test case.
 *
 * @public
 * @remarks
 * Useful for getting a handle on the World when using arrow functions and thus
 * being unable to rely on the value of `this`. Only callable from the body of a
 * step or a `Before`, `After`, `BeforeStep` or `AfterStep` hook (will throw
 * otherwise).
 */
export function getWorld<ParametersType = any>(): IWorld<ParametersType> {
  const store = testCaseScope.getStore()
  if (!store) {
    throw new Error(
      'Called `getWorld` from incorrect scope; only applicable to steps and case-level hooks'
    )
  }
  return store.world as IWorld<ParametersType>
}
