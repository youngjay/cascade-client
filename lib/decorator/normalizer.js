var normalizeFields = require('../util/normalize-fields');

module.exports = require('mixin-class')(
    require('./base'),
    {
        query: function(fields) {
            return this.fetcher.fetch(normalizeFields(fields));
        }
    }
);