var colors = require('colors/safe');

function Colors (useColors) {
  colors.enabled = useColors;
  return {
    ambiguous: colors.magenta,
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
