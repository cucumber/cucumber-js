var String = {
    count: function count(hayStack, needle) {
        'use strict';
        var splitHayStack = hayStack.split(needle);
        return splitHayStack.length - 1;
    }
};
module.exports = String;