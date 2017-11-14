module.exports = require('mixin-class')(
    require('./base'),
    {
        fetch: function(fields) {
            console.log('%c[cascade] %c' + fields.map(function(field) {
                return field.type + '.' + field.category
            }).join (','), 'color: green', 'color: black')

            return this.fetcher.fetch(fields)
        }
    }
);