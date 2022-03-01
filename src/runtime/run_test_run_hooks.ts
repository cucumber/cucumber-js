import UserCodeRunner from '../user_code_runner'
import VError from 'verror'
import { formatLocation } from '../formatter/helpers'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import TestRunHookDefinition from '../models/test_run_hook_definition'

export type RunsTestRunHooks = (
  definitions: TestRunHookDefinition[],
  name: string
) => Promise<void>

export const makeRunTestRunHooks = (
  dryRun: boolean,
  defaultTimeout: number,
  errorMessage: (name: string, location: string) => string
): RunsTestRunHooks =>
  dryRun
    ? async () => {}
    : async (definitions, name) => {
        for (const hookDefinition of definitions) {
          const { error } = await UserCodeRunner.run({
            argsArray: [],
            fn: hookDefinition.code,
            thisArg: null,
            timeoutInMilliseconds: valueOrDefault(
              hookDefinition.options.timeout,
              defaultTimeout
            ),
          })
          if (doesHaveValue(error)) {
            const location = formatLocation(hookDefinition)
            throw new VError(error, errorMessage(name, location))
          }
        }
      }
