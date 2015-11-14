var _ = require('lodash');

var getFieldAs = require('../../util/get-field-as');

var CASCADE_ERROR_PREFIX = '[Cascade Error] ';
var CASCADE_ERROR_PREFIX_LENGTH = CASCADE_ERROR_PREFIX.length;

var getErrors = function(fields, data) {
    return _.reduce(_.isArray(data) ? data : [data], function(errors, obj) {
        return fields.reduce(function(errors, field) {
            var as = getFieldAs(field);
            var v = obj[as];
            if (_.isString(v) && v.indexOf(CASCADE_ERROR_PREFIX) !== -1) {
                return errors.concat(v.substring(CASCADE_ERROR_PREFIX_LENGTH));
            }
            if (_.isObject(v) && field.children) {
                return errors.concat(getErrors(field.children, v))
            }
            return errors;
        }, errors);
    }, []);
};

module.exports = require('./base').extend(
    {
        options: {
            sep: '; '
        },

        fetch: function(fields) {
            var self = this;
            return this.fetcher.fetch(fields).then(function(data) {
                var errors = getErrors(fields, data);
                if (errors.length) {
                    return Promise.reject(errors.join(self.options.sep));
                } else {
                    return data;
                }
            });
        }
    }
);