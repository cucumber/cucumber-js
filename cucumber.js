var common = [
  '--require-module @babel/register',
  `--format ${
    process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress'
  }`,
  '--format rerun:@rerun.txt',
  '--format usage:usage.txt',
  '--format event-protocol:events.ndjson'
].join(' ')

module.exports = {
  default: common,
}
