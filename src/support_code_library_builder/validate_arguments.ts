import _ from 'lodash'
import { doesNotHaveValue } from '../value_checker'
import { DefineStepPattern, IDefineStepOptions } from './types'

interface IValidation {
  identifier: string
  expectedType: string
  predicate: (args: any) => boolean
}

interface IDefineStepArguments {
  pattern?: DefineStepPattern
  options?: IDefineStepOptions
  code?: Function
}

const optionsValidation = {
  expectedType: 'object or function',
  predicate({ options }: IDefineStepArguments) {
    return _.isPlainObject(options)
  },
}

const optionsTimeoutValidation = {
  identifier: '"options.timeout"',
  expectedType: 'integer',
  predicate({ options }: IDefineStepArguments) {
    return doesNotHaveValue(options.timeout) || _.isInteger(options.timeout)
  },
}

const fnValidation = {
  expectedType: 'function',
  predicate({ code }: IDefineStepArguments) {
    return _.isFunction(code)
  },
}

const validations: Record<string, IValidation[]> = {
  defineTestRunHook: [
    { identifier: 'first argument', ...optionsValidation },
    optionsTimeoutValidation,
    { identifier: 'second argument', ...fnValidation },
  ],
  defineTestCaseHook: [
    { identifier: 'first argument', ...optionsValidation },
    {
      identifier: '"options.tags"',
      expectedType: 'string',
      predicate({ options }) {
        return doesNotHaveValue(options.tags) || _.isString(options.tags)
      },
    },
    optionsTimeoutValidation,
    { identifier: 'second argument', ...fnValidation },
  ],
  defineTestStepHook: [
    { identifier: 'first argument', ...optionsValidation },
    {
      identifier: '"options.tags"',
      expectedType: 'string',
      predicate({ options }) {
        return doesNotHaveValue(options.tags) || _.isString(options.tags)
      },
    },
    optionsTimeoutValidation,
    { identifier: 'second argument', ...fnValidation },
  ],
  defineStep: [
    {
      identifier: 'first argument',
      expectedType: 'string or regular expression',
      predicate({ pattern }) {
        return _.isRegExp(pattern) || _.isString(pattern)
      },
    },
    { identifier: 'second argument', ...optionsValidation },
    optionsTimeoutValidation,
    { identifier: 'third argument', ...fnValidation },
  ],
}

export default function validateArguments({
  args,
  fnName,
  location,
}: {
  args?: IDefineStepArguments
  fnName: string
  location: string
}): void {
  validations[fnName].forEach(({ identifier, expectedType, predicate }) => {
    if (!predicate(args)) {
      throw new Error(
        `${location}: Invalid ${identifier}: should be a ${expectedType}`
      )
    }
  })
}
