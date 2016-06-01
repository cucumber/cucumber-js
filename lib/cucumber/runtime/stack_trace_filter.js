var path = require('path');
var chain = require('stack-chain');
var _ = require('lodash');

var currentFilter = null;
var cucumberPath = path.join(__dirname, '..');

function isFrameInCucumber(frame) {
  var fileName = frame.getFileName() || '';
  return fileName.indexOf(cucumberPath) !== -1;
}

function filter() {
  currentFilter = chain.filter.attach(function (error, frames) {
    if (isFrameInCucumber(frames[0])) {
      return frames;
    }
    return frames.filter(_.negate(isFrameInCucumber));
  });
}

function unfilter() {
  chain.filter.deattach(currentFilter);
}

module.exports = {
  filter: filter,
  unfilter: unfilter
};
