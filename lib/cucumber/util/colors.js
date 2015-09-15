var colors = require('colors/safe');

colors.setTheme({
  'comment'   : 'grey',
  'failed'    : 'red',
  'passed'    : 'green',
  'pending'   : 'yellow',
  'skipped'   : 'cyan',
  'tag'       : 'cyan',
  'undefined' : 'yellow'
});

module.exports = colors;
