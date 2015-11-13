var _ = require('lodash');

var normalizeMany = function(fields, extraParams) {
    return fields.reduce(function(all, field) {
        return all.concat(normalizeOne(field, extraParams));
    }, []);
};

var normalizeOne = function(field, extraParams) {
    if (!field.params) {
        field.params = {};
    }

    _.assign(field.params, extraParams);

    if (!field.children) {
        field.children = [];
    }

    field.children = normalizeMany(field.children)

    if (!field.type) {
        return normalizeMany(field.children, field.params)
    }

    if (!field.category) {
        field.category = 'query'
    }

    return [field];
};

module.exports = require('mixin-class')(
    function(fetcher) {
        this.fetcher = fetcher;
    },
    {
        query: function(fields) {
            return this.fetcher.fetch(normalizeMany(_.isArray(fields) ? fields : [fields], {}));
        }
    }
);