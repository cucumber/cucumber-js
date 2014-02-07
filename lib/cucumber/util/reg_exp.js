var RegExp = {
    escapeString: function escapeString(string) {
        'use strict';
        return string.replace(RegExp.ESCAPE_PATTERN, RegExp.ESCAPE_REPLACEMENT);
    }
};

RegExp.ESCAPE_PATTERN     = /[-[\]{}()*+?.\\^$|#\n\/]/g;
RegExp.ESCAPE_REPLACEMENT = '\\$&';
module.exports = RegExp;
