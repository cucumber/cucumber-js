require.paths.unshift('../lib');

beforeEach(function() {
  this.addMatchers({
    toBeAFunction:          function()          { return typeof(this.actual) == 'function'; },
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
    }
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
  this.plan = function() {
    if (typeof(this.count) === 'undefined')
      this.count = 0;
    return values[this.count++];
  };
  return this;
};
