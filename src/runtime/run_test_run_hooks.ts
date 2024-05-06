import { JsonObject } from 'type-fest'
import UserCodeRunner from '../user_code_runner'
import { formatLocation } from '../formatter/helpers'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import { runInTestRunScope } from './scope'

export type RunsTestRunHooks = (
  definitions: TestRunHookDefinition[],
  name: string
) => Promise<void>

export const makeRunTestRunHooks = (
  dryRun: boolean,
  defaultTimeout: number,
  worldParameters: JsonObject,
  errorMessage: (name: string, location: string) => string
): RunsTestRunHooks =>
  dryRun
    ? async () => {}
    : async (definitions, name) => {
        const context = { parameters: worldParameters }
        for (const hookDefinition of definitions) {
          const { error } = await runInTestRunScope({ context }, () =>
            UserCodeRunner.run({
              argsArray: [],
              fn: hookDefinition.code,
              thisArg: context,
              timeoutInMilliseconds: valueOrDefault(
                hookDefinition.options.timeout,
                defaultTimeout
              ),
            })
          )
          if (doesHaveValue(error)) {
            const location = formatLocation(hookDefinition)
            throw new Error(errorMessage(name, location), { cause: error })
          }
        }
      }
