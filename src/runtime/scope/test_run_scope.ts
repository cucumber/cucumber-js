import { AsyncLocalStorage } from 'node:async_hooks'
import { IContext } from '../../support_code_library_builder/context'
import { makeProxy } from './make_proxy'

interface TestRunScopeStore<ParametersType = any> {
  context: IContext<ParametersType>
}

const testRunScope = new AsyncLocalStorage<TestRunScopeStore>()

export async function runInTestRunScope<ResponseType>(
  store: TestRunScopeStore,
  callback: () => ResponseType
) {
  return testRunScope.run(store, callback)
}

function getContext<ParametersType = any>(): IContext<ParametersType> {
  const store = testRunScope.getStore()
  if (!store) {
    throw new Error(
      'Attempted to access `context` from incorrect scope; only applicable to run-level hooks'
    )
  }
  return store.context as IContext<ParametersType>
}

/**
 * A proxy to the context for the currently-executing test run.
 *
 * @beta
 * @remarks
 * Useful for getting a handle on the context when using arrow functions and thus
 * being unable to rely on the value of `this`. Only callable from the body of a
 * `BeforeAll` or `AfterAll` hook (will throw otherwise).
 */
export const contextProxy = makeProxy<IContext>(getContext)
