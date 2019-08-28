var common = [
  '--require-module @babel/register',
  `--format ${
    process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'
  }`,
  '--format rerun:@rerun.txt',
  '--format usage:usage.txt',
].join(' ')

module.exports = {
  default: common,
}
