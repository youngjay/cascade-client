var _ = require('lodash');

var CASCADE_ERROR_PREFIX = '[Cascade Error] ';
var CASCADE_ERROR_PREFIX_LENGTH = CASCADE_ERROR_PREFIX.length;

var getErrors = function(data) {
    return _.reduce(data, function(errors, v) {
        if (_.isString(v) && v.indexOf(CASCADE_ERROR_PREFIX) !== -1) {
            return errors.concat(v.substring(CASCADE_ERROR_PREFIX_LENGTH));
        }
        if (_.isObject(v)) {
            return errors.concat(getErrors(v))
        }
        return errors;
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
                var errors = getErrors(data);
                if (errors.length) {
                    return Promise.reject(errors.join(self.options.sep));
                } else {
                    return data;
                }
            });
        }
    }
);