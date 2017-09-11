module.exports = require('mixin-class')(
    require('./base'),
    {
        options: {
            timeout: 400
        },

        fetch: function(fields) {
            var timeout = this.options.timeout;
            return this.fetcher.fetch(fields).then(function(data) {                
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve(data);
                    }, timeout)
                })
            })
        }
    }
);