var _ = require('lodash');

var getFieldAs = require('../util/get-field-as');

var CASCADE_ERROR_PREFIX = '[Cascade Error] ';
var CASCADE_ERROR_PREFIX_LENGTH = CASCADE_ERROR_PREFIX.length;

var getErrorsFromArray = function(fields, arr) {
    return arr.reduce(function(errors, obj) {
        return errors.concat(getErrorsFromObject(fields, obj))
    }, []);
};

var getErrorsFromObject = function(fields, obj) {
    return fields.reduce(function(errors, field) {
        var as = getFieldAs(field);
        var v = obj[as];
        if (_.isString(v) && v.indexOf(CASCADE_ERROR_PREFIX) !== -1) {
            return errors.concat(v.substring(CASCADE_ERROR_PREFIX_LENGTH));
        }
        if (_.isObject(v) && field.children) {
            return errors.concat((_.isArray(v) ? getErrorsFromArray : getErrorsFromObject)(field.children, v));
        }
        return errors;
    }, []);
}

module.exports = require('mixin-class')(
    require('./base'),
    function ErrorRejector() {},
    {
        options: {
            sep: '; '
        },

        fetch: function(fields) {
            var self = this;
            return this.fetcher.fetch(fields).then(function(data) {
                var errors = getErrorsFromObject(fields, data);
                if (errors.length) {
                    return Promise.reject(new Error(errors.join(self.options.sep)));
                } else {
                    return data;
                }
            });
        }
    }
);