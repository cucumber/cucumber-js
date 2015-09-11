common = '--tag ~@ruby-only'

module.exports = {
  build: '--format progress --no-snippets ' + common,
  'default': common
};
