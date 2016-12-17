var common = [
  '--compiler js:babel-register',
  '--format progress',
  '--format rerun:@rerun.txt'
].join(' ')

module.exports = {
  'default': common,
  'node-4': common + ' --tags "not @node-6"',
  'node-0.12': common + ' --tags "not @node-4 and not @node-6"'
};
