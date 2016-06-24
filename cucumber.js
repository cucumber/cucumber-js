common = '--strict --format progress --format rerun:@rerun.txt'

module.exports = {
  'default': common,
  'es5': common + ' --tags ~@es6'
};
