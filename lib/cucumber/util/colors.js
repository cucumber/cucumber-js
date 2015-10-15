function Colors (useColors) {
  var colors = require('colors/safe');
  colors.enabled = useColors;
  return {
    comment: colors.grey,
    failed: colors.red,
    passed: colors.green,
    pending: colors.yellow,
    skipped: colors.cyan,
    tag: colors.cyan,
    undefined: colors.yellow
  };
}

module.exports = Colors;
