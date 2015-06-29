var Debug = {
  TODO: function TODO(description) {
    return function () { throw(new Error('IMPLEMENT ME: ' + description)); };
  },

  warn: function warn(string, caption, level) {
    if (Debug.isMessageLeveltoBeDisplayed(level))
      process.stdout.write(Debug.warningString(string, caption));
  },

  notice: function notice(string, caption, level) {
    if (Debug.isMessageLeveltoBeDisplayed(level))
      process.stdout.write(Debug.noticeString(string, caption));
  },

  warningString: function warningString(string, caption) {
    caption = caption || 'debug-warning';
    return '\x1B[30;43m' + caption + ':\x1B[0m[33m' + string + '\x1B[0m';
  },

  noticeString: function noticeString(string, caption) {
    caption = caption || 'debug-notice';
    return '\x1B[30;46m' + caption + ':\x1B[0m \x1B[36m' + string + '\x1B[0m';
  },

  prefix: function prefix() {
    return ;
  },

  isMessageLeveltoBeDisplayed: function isMessageLeveltoBeDisplayed(level) {
    if (process.env) {
      level = level || 3; // default level
      return (level <= process.env.DEBUG_LEVEL);
    } else {
      return false;
    }
  }
};

Debug.SimpleAstListener = require('./debug/simple_ast_listener');
module.exports          = Debug;
