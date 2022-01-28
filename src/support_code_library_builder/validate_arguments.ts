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
    return typeof options === 'object'
  },
}

const optionsTimeoutValidation = {
  identifier: '"options.timeout"',
  expectedType: 'integer',
  predicate({ options }: IDefineStepArguments) {
    return options.timeout == null || typeof options.timeout === 'number'
  },
}

const fnValidation = {
  expectedType: 'function',
  predicate({ code }: IDefineStepArguments) {
    return typeof code === 'function'
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
        return options.tags == null || typeof options.tags === 'string'
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
        return options.tags == null || typeof options.tags === 'string'
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
        return pattern instanceof RegExp || typeof pattern === 'string'
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
