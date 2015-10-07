function createSimpleMatcher (fn) {
  return function () {
    return {
      compare: function() {
        return {
          pass: fn.apply(null, arguments)
        };
      }
    };
  };
}


var customMatchers = {
  toBeAnInstanceOf: createSimpleMatcher(function (actual, expected) {
    return actual.constructor && actual.constructor === expected;
  }),

  toBeAFunction: createSimpleMatcher(function (actual) {
    return typeof(actual) === 'function';
  }),

  toHaveBeenCalledTimes: createSimpleMatcher(function (actual, expected) {
    return actual.calls.count() === expected;
  }),

  toHaveBeenCalledWithValueAsNthParameter: createSimpleMatcher(function (actual, value, parameterOffset) {
    for(var i = 0; i < actual.calls.count(); i++) {
      var parameter = actual.calls.argsFor(i)[parameterOffset - 1];
      if (parameter === value)
        return true;
    }
    return false;
  }),

  toHaveBeenCalledWithAFunctionAsNthParameter: createSimpleMatcher(function (actual, parameterOffset) {
    for(var i = 0; i < actual.calls.count(); i++) {
      var parameter = actual.calls.argsFor(i)[parameterOffset - 1];
      if (typeof(parameter) === 'function')
        return true;
    }
    return false;
  }),

  toHaveBeenCalledWithRegExpAsNthParameter: createSimpleMatcher(function (actual, regexp, parameterOffset) {
    if (regexp.constructor !== RegExp)
      throw new Error("Please pass a RegExp instance");
    for(var i = 0; i < actual.calls.count(); i++) {
      var parameter = actual.calls.argsFor(i)[parameterOffset - 1];
      if (parameter.constructor && parameter.constructor === RegExp && parameter.toString() === regexp.toString())
        return true;
    }
    return false;
  }),

  toHaveBeenCalledWithInstanceOfConstructorAsNthParameter: createSimpleMatcher(function (actual, constructor, parameterOffset) {
    for(var i = 0; i < actual.calls.count(); i++) {
      var parameter = actual.calls.argsFor(i)[parameterOffset - 1];
      if (parameter instanceof constructor)
        return true;
    }
    return false;
  }),

  toHaveBeenCalledWithStringMatching: createSimpleMatcher(function (actual, pattern) {
    for(var i = 0; i < actual.calls.count(); i++) {
      var parameter = actual.calls.argsFor(i)[0];
      if ((pattern.test && pattern.test(parameter)) ||
          (typeof(pattern) === 'string' && parameter.indexOf(pattern) >= 0))
        return true;
    }
    return false;
  }),

  toHaveBeenRequired: createSimpleMatcher(function (actual) {
    return actual.requireCount > 0;
  }),
};

module.exports = customMatchers;
