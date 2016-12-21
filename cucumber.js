var common = [
  '--compiler js:babel-register',
  '--format progress',
  '--format rerun:@rerun.txt'
].join(' ')

module.exports = {
  'default': common,
  'node-4': common + ' --tags "not @node-6"',
};
