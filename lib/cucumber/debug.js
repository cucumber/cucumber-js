var Debug = {
  TODO: function TODO(description) {
    return function() { throw(new Error("IMPLEMENT ME: " + description)); };
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
    return "\033[30;43m" + caption + ":\033[0m \033[33m" + string + "\033[0m"
  },

  noticeString: function noticeString(string, caption) {
    caption = caption || 'debug-notice';
    return "\033[30;46m" + caption + ":\033[0m \033[36m" + string + "\033[0m"
  },

  prefix: function prefix() {
    return ;
  },

  isMessageLeveltoBeDisplayed: function isMessageLeveltoBeDisplayed(level) {
    if (process.env) {
      level = level || 3; // default level
      return (level <= process.env['DEBUG_LEVEL']);
    } else {
      return false;
    }
  }
};
Debug.SimpleAstListener = require('./debug/simple_ast_listener');
module.exports          = Debug;
