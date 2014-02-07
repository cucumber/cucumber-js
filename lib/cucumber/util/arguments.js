var Arguments = function Arguments(argumentsObject) {
    'use strict';
    return Array.prototype.slice.call(argumentsObject);
};
module.exports = Arguments;