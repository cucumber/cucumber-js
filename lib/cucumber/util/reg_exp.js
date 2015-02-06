var _RegExp = {
  escapeString: function escapeString(string) {
    var escaped = string.replace(_RegExp.ESCAPE_PATTERN, _RegExp.ESCAPE_REPLACEMENT);
    return escaped;
  }
};

_RegExp.ESCAPE_PATTERN     = /[-[\]{}()*+?.\\^$|#\n\/]/g;
_RegExp.ESCAPE_REPLACEMENT = '\\$&';
module.exports = _RegExp;
