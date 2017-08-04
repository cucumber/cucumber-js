import _ from 'lodash'

const optionsValidation = {
  expectedType: 'object or function',
  predicate({ options }) {
    return _.isPlainObject(options)
  }
}

const optionsTimeoutValidation = {
  identifier: '"options.timeout"',
  expectedType: 'integer',
  predicate({ options }) {
    return !options.timeout || _.isInteger(options.timeout)
  }
}

const fnValidation = {
  expectedType: 'function',
  predicate({ code }) {
    return _.isFunction(code)
  }
}

const validations = {
  defineTestRunHook: [
    { identifier: 'first argument', ...optionsValidation },
    optionsTimeoutValidation,
    { identifier: 'second argument', ...fnValidation }
  ],
  defineTestCaseHook: [
    { identifier: 'first argument', ...optionsValidation },
    {
      identifier: '"options.tags"',
      expectedType: 'string',
      predicate({ options }) {
        return !options.tags || _.isString(options.tags)
      }
    },
    optionsTimeoutValidation,
    { identifier: 'second argument', ...fnValidation }
  ],
  defineStep: [
    {
      identifier: 'first argument',
      expectedType: 'string or regular expression',
      predicate({ pattern }) {
        return _.isRegExp(pattern) || _.isString(pattern)
      }
    },
    { identifier: 'second argument', ...optionsValidation },
    optionsTimeoutValidation,
    { identifier: 'third argument', ...fnValidation }
  ]
}

export default function validateArguments({ args, fnName, location }) {
  validations[fnName].forEach(({ identifier, expectedType, predicate }) => {
    if (!predicate(args)) {
      throw new Error(
        `${location}: Invalid ${identifier}: should be a ${expectedType}`
      )
    }
  })
}
