var helpers = {

  getAdditionalErrorText: function getAdditionalErrorText(lastRun) {
    return 'Error:\n' + lastRun.error + '.\n' +
           'stderr:\n' + lastRun.stderr;
  },

  normalizeText: function normalizeText(text) {
    return text.replace(/\033\[[0-9;]*m/g, '')
      .replace(/\r\n|\r/g, '\n')
      .replace(/^\s+/g, '')
      .replace(/\s+$/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\d+m\d{2}\.\d{3}s/, '<duration-stat>')
      .replace(/\//g, require('path').join('/'));
  }

};

module.exports = helpers;
