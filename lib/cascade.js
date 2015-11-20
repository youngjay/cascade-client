var normalizeFields = require('./util/normalize-fields');

module.exports = require('mixin-class')(
    function Cascade(fetcher) {
        this.fetcher = fetcher;
    },
    {
        query: function(fields) {
            return this.fetcher.fetch(normalizeFields(fields));
        }
    }
);