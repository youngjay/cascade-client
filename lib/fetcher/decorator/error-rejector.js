var _ = require('lodash');

var CASCADE_ERROR_PREFIX = '[Cascade Error] ';
var CASCADE_ERROR_PREFIX_LENGTH = CASCADE_ERROR_PREFIX.length;

var getErrors = function(data) {
    var errors = [];
    reduceGetErrors(data, errors);
    return errors;
};

var reduceGetErrors = function(data, errors) {
    _.forEach(data, function(v) {
        if (_.isString(v) && v.indexOf(CASCADE_ERROR_PREFIX) !== -1) {
            errors.push(v.substring(CASCADE_ERROR_PREFIX_LENGTH));
            return;
        }

        if (_.isObject(v)) {
            reduceGetErrors(v, errors);
        }
    });
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