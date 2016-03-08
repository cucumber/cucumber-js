var colors = require('colors/safe');

function Colors (useColors) {
  colors.enabled = useColors;
  return {
    ambiguous: colors.red,
    bold: colors.bold,
    failed: colors.red,
    location: colors.grey,
    passed: colors.green,
    pending: colors.yellow,
    skipped: colors.cyan,
    tag: colors.cyan,
    undefined: colors.yellow
  };
}

module.exports = Colors;
