var _ = require('lodash');

module.exports = require('mixin-class').extend(
    function(fetcher, options) {
        this.fetcher = fetcher;
        this.options = _.assign({}, this.options, options);
    },
    {
        options: {}
    }
);