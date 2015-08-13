var path = require('path');
var chain = require('stack-chain');

var currentFilter = null;

function filter() {
  currentFilter = chain.filter.attach(function (error, frames) {
    return frames.filter(function (frame) {
      var f = frame.getFileName() || '';
      var ignoredPath = path.join(__dirname, '..');
      return f.indexOf(ignoredPath) === -1;
    });
  });
}

function unfilter() {
  chain.filter.deattach(currentFilter);
}

module.exports = {
  filter: filter,
  unfilter: unfilter
};
