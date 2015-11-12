var _ = require('lodash');

var uncapitalize = function(str) {
    if (!str) {
        return str;
    }
    return str[0].toLowerCase() + str.substring(1);
};

var DEFAULT_CATEGORY = 'query';

module.exports = function(field) {
    var as = field.as;
    
    if (as) {
        return as;
    }

    as = uncapitalize(field.type);

    if (field.category && field.category !== DEFAULT_CATEGORY) {
        as += '_' + field.category
    }
    
    return as;
};