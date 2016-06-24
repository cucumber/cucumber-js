require('../../support/spec_helper');

describe("Cucumber.Util.run", function () {
  var Cucumber = requireLib('cucumber');

  describe("run()", function () {
    var fn, thisArg, argsArray, timeoutInMilliseconds;

    beforeEach(function() {
      thisArg = {};
      argsArray = [];
      timeoutInMilliseconds = 100;
    });

    describe("function uses synchronous interface", function() {
      describe("function throws", function() {
        describe('error object', function() {
          beforeEach(function() {
            fn = function() { throw 'error'; };
          });

          it('returns the error', function (done) {
            Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
              expect(error).toEqual('error');
              expect(result).toBeUndefined();
              done();
            });
          });
        });

        describe('non-serializable object', function() {
          beforeEach(function() {
            var error = {};
            error.error = error;
            fn = function() { throw error; };
          });

          it('returns the error', function (done) {
            Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
              expect(error).toEqual('{ error: [Circular] }');
              expect(result).toBeUndefined();
              done();
            });
          });
        });
      });

      describe("function does not throws", function() {
        beforeEach(function() {
          fn = function() { return 'result'; };
        });

        it('returns the return value of the function', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toBeNull();
            expect(result).toEqual('result');
            done();
          });
        });
      });
    });

    describe("function uses asynchronous callback interface", function() {
      describe("function throws", function() {
        beforeEach(function() {
          fn = function(callback) {
            setTimeout(function(){ throw 'error'; }, 25);
            setTimeout(function(){ callback(); }, 50);
          };
        });

        it('returns the error', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toEqual('error');
            expect(result).toBeUndefined();
            done();
          });
        });
      });

      describe("function calls back with error", function() {
        beforeEach(function() {
          fn = function(callback) {
            setTimeout(function(){ callback('error'); }, 25);
          };
        });

        it('returns the error', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toEqual('error');
            expect(result).toBeUndefined();
            done();
          });
        });
      });

      describe("function calls back without error", function() {
        beforeEach(function() {
          fn = function(callback) {
            setTimeout(function(){ callback(null, 'result'); }, 25);
          };
        });

        it('returns the what the function calls back with', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toBeNull();
            expect(result).toEqual('result');
            done();
          });
        });
      });

      describe("function times out", function() {
        beforeEach(function() {
          fn = function(callback) {
            setTimeout(function(){ callback(null, 'result'); }, 200);
          };
        });

        it('returns timeout as an error', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toEqual('function timed out after 100 milliseconds');
            expect(result).toBeUndefined();
            done();
          });
        });
      });

      describe("function also returns a promise", function() {
        beforeEach(function() {
          fn = function(callback) {
            return {
              then: function() { callback(); }
            };
          };
        });

        it('returns an error that only one interface should be used', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toEqual('function accepts a callback and returns a promise');
            expect(result).toBeUndefined();
            done();
          });
        });
      });
    });

    describe("function uses promise interface", function() {
      describe("function throws", function() {
        beforeEach(function() {
          fn = function() {
            return {
              then: function() {
                setTimeout(function(){ throw 'error'; }, 25);
              }
            };
          };
        });

        it('returns the error', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toEqual('error');
            expect(result).toBeUndefined();
            done();
          });
        });
      });

      describe("promise resolves", function() {
        beforeEach(function() {
          fn = function() {
            return {
              then: function(resolve) {
                setTimeout(function(){ resolve('result'); }, 25);
              }
            };
          };
        });

        it('returns what the promise resolves to', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toBeNull();
            expect(result).toEqual('result');
            done();
          });
        });
      });

      describe("promise rejects with reason", function() {
        beforeEach(function() {
          fn = function() {
            return {
              then: function(resolve, reject) {
                setTimeout(function(){ reject('error'); }, 25);
              }
            };
          };
        });

        it('returns what the promise rejects as an error', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toEqual('error');
            expect(result).toBeUndefined();
            done();
          });
        });
      });

      describe("promise rejects without reason", function() {
        beforeEach(function() {
          fn = function() {
            return {
              then: function(resolve, reject) {
                setTimeout(function(){ reject(); }, 25);
              }
            };
          };
        });

        it('returns "promise rejected" as an error', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toEqual('Promise rejected');
            expect(result).toBeUndefined();
            done();
          });
        });
      });

      describe("function times out", function() {
        beforeEach(function() {
          fn = function() {
            return {
              then: function(resolve) {
                setTimeout(function(){ resolve('result'); }, 200);
              }
            };
          };
        });

        it('returns timeout as an error', function (done) {
          Cucumber.Util.run(fn, thisArg, argsArray, timeoutInMilliseconds, function(error, result) {
            expect(error).toEqual('function timed out after 100 milliseconds');
            expect(result).toBeUndefined();
            done();
          });
        });
      });
    });
  });
});
