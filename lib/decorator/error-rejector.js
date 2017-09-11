var _ = require('lodash');

var getFieldAs = require('../util/get-field-as');

var CASCADE_ERROR_PREFIX = '[Cascade Error] ';
var CASCADE_ERROR_PREFIX_LENGTH = CASCADE_ERROR_PREFIX.length;


var CASCADE_WARNING_PREFIX = '[Cascade Warning] ';
var CASCADE_WARNING_PREFIX_LENGTH = CASCADE_WARNING_PREFIX.length;

var push = [].push;

var getErrorsFromArray = function(fields, arr, results) {
    arr.forEach(function(obj) {
        getErrorsFromObject(fields, obj, results)
    });
};

var getErrorsFromObject = function(fields, obj, results) {
    fields.forEach(function(field) {
        var errors = results.errors;
        var warnings = results.warnings;
        
        var as = getFieldAs(field);
        var v = obj[as];
        if (_.isString(v)) {
            if (v.indexOf(CASCADE_ERROR_PREFIX) !== -1) {
                errors.push(v.substring(CASCADE_ERROR_PREFIX_LENGTH));
            }
            if (v.indexOf(CASCADE_WARNING_PREFIX) !== -1) {
                warnings.push(v.substring(CASCADE_WARNING_PREFIX_LENGTH));
            }
        }
        if (_.isObject(v) && field.children) {
            (_.isArray(v) ? getErrorsFromArray : getErrorsFromObject)(field.children, v, results);
        }
    });
}

module.exports = require('mixin-class')(
    require('./base'),
    function ErrorRejector() {},
    {
        options: {
            errorReplaceText: '系统繁忙,请稍候重试',
            sep: '; '
        },

        fetch: function(fields) {
            var self = this;
            return this.fetcher.fetch(fields).then(function(data) {
                var errors = [];
                var warnings = [];

                var results = {
                    errors: errors,
                    warnings: warnings
                };

                getErrorsFromObject(fields, data, results);
                

                if (errors.length) {
                    errors.forEach(function(error) {
                        console.error(error);
                        warnings.push(self.options.errorReplaceText);
                    });
                }

                if (warnings.length) {
                    return Promise.reject(new Error(warnings.join(self.options.sep)));
                } else {
                    return data;
                }
            });
        }
    }
);