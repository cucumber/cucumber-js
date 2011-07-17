var Debug = {
  TODO: function(description) {
    return function() { throw("IMPLEMENT ME: " + description); };
  }
};

Debug.SimpleAstListener = require('./debug/simple_ast_listener');

module.exports = Debug;