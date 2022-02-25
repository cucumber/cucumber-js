import UserCodeRunner from '../user_code_runner'
import VError from 'verror'
import { formatLocation } from '../formatter/helpers'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import TestRunHookDefinition from '../models/test_run_hook_definition'

export const runTestRunHooks = (
  { dryRun }: { dryRun: boolean },
  { defaultTimeout }: { defaultTimeout: number }
) =>
  dryRun
    ? async () => {}
    : async (
        definitions: TestRunHookDefinition[],
        name: string
      ): Promise<void> => {
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
            throw new VError(
              error,
              `${name} hook errored, process exiting: ${location}`
            )
          }
        }
      }
