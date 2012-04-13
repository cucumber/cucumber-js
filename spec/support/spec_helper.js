beforeEach(function() {
  this.addMatchers({
    toBeAnInstanceOf: function(constructor) {
      return this.actual.constructor && this.actual.constructor == constructor;
    },

    toBeAFunction: function() { return typeof(this.actual) == 'function'; },

    toHaveBeenCalledNTimes: function(callCount) { return callCount == this.actual.callCount; },

    toHaveBeenCalledWithValueAsNthParameter: function(value, parameterOffset) {
      for(var i = 0; i < this.actual.callCount; i++) {
        var parameter = this.actual.argsForCall[i][parameterOffset - 1];
        if (parameter == value)
          return true;
      }
      return false;
    },

    toHaveBeenCalledWithAFunctionAsNthParameter: function(parameterOffset) {
      for(var i = 0; i < this.actual.callCount; i++) {
        var parameter = this.actual.argsForCall[i][parameterOffset - 1];
        if (typeof(parameter) == 'function')
          return true;
      }
      return false;
    },

    toHaveBeenCalledWithRegExpAsNthParameter: function(regexp, parameterOffset) {
      if (regexp.constructor != RegExp)
        throw new Error("Please pass a RegExp instance");
      for(var i = 0; i < this.actual.callCount; i++) {
        var parameter = this.actual.argsForCall[i][parameterOffset - 1];
        if (parameter.constructor && parameter.constructor == RegExp && parameter.toString() == regexp.toString())
          return true;
      }
      return false;
    },

    toHaveBeenCalledWithInstanceOfConstructorAsNthParameter: function(constructor, parameterOffset) {
      for(var i = 0; i < this.actual.callCount; i++) {
        var parameter = this.actual.argsForCall[i][parameterOffset - 1];
        if (parameter instanceof constructor)
          return true;
      }
      return false;
    },

    toHaveBeenCalledWithStringMatching: function(pattern) {
      for(var i = 0; i < this.actual.callCount; i++) {
        var parameter = this.actual.argsForCall[i][0];
        if ((pattern.test && pattern.test(parameter)) ||
            (typeof(pattern) == 'string' && parameter.indexOf(pattern) >= 0))
          return true;
      }
      return false;
    },

    toHaveBeenRequired: function() {
      return this.actual.requireCount > 0;
    },
  });
});

spyOnStub = function(obj, methodName) {
  obj[methodName] = function() {};
  return spyOn(obj, methodName);
};

createSpyWithStubs = function(name, stubs) {
  var spy = jasmine.createSpy(name);
  for (var stubMethod in stubs) {
    spy[stubMethod] = function() {};
    spyOn(spy, stubMethod).andReturn(stubs[stubMethod]);
  }
  return (spy);
};

createEmittingSpy = function(name) {
  var spy = jasmine.createSpy(name);
  spy.callbacks = {};
  spy.on        = function() {};
  spy.emit      = function() {
    var args  = Array.prototype.slice.call(arguments);
    var event = args.shift();

    if (this.callbacks[event] !== undefined) {
      this.callbacks[event].forEach(function(callback) {
        callback.call(null, args);
      });
    }
  };
  spyOn(spy, 'on').andCallFake(function(event, callback) {
    if (spy.callbacks[event] === undefined) {
      spy.callbacks[event] = [];
    }
    spy.callbacks[event].push(callback);
  });
  return spy;
};

jasmine.Spy.prototype.andReturnSeveral = function(values) {
  var count = 0;
  this.plan = function() {
    return values[count++];
  };
  return this;
};

var moduleSpies = {};
var originalJsLoader = require.extensions['.js'];

spyOnModule = function spyOnModule(module) {
  var spy           = createSpy("spy on module \"" + module + "\"");
  spy.requireCount  = 0;
  return spyOnModuleAndReturn(module, spy);
};

spyOnModuleAndReturn = function spyOnModuleAndReturn(module, spy) {
  var path          = require.resolve(module);
  moduleSpies[path] = spy;
  delete require.cache[path];
  return spy;
};

require.extensions['.js'] = function (obj, path) {
  var spy = moduleSpies[path];
  if (spy) {
    spy.requireCount++;
    obj.exports = spy;
  } else {
    return originalJsLoader(obj, path);
  }
}

requireLib = function(modulePath) {
  return require('../../lib/' + modulePath);
};

afterEach(function() {
  for (var path in moduleSpies) {
    delete moduleSpies[path];
  }
});
