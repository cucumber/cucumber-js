function Colors(useColors) {
  if(useColors) {
    var colors = require('colors/safe');
    colors.enabled = true;
    return {
      comment: colors.grey,
      failed: colors.red,
      passed: colors.green,
      pending: colors.yellow,
      skipped: colors.cyan,
      tag: colors.cyan,
      undefined: colors.yellow
    };
  } else {
    var identity = function(x) { return x; }
    return {
      comment: identity,
      failed: identity,
      passed: identity,
      pending: identity,
      skipped: identity,
      tag: identity,
      undefined: identity
    };
  }

}

module.exports = Colors;
