var _ = require('lodash');

var getFieldAs = require('../util/get-field-as');

var buildContextParams = function(primary, secondary) {
    var o = Object.create(secondary);
    _.assign(o, primary);
    return o;
}

module.exports = require('./api').extend(
    function(repo) {
        this.repo = repo;
    },
    {
        query: function(fields) {
            var self = this;

            return new Promise(function(resolve, reject) {
                try {
                    resolve(self.buildFields({}, fields, {}));
                } catch(e) {
                    console.log(11)
                    reject(e);
                }
            })
        },

        buildFields: function(results, fields, parentParams) {
            var params = buildContextParams(results, parentParams);

            var self = this;

            fields.forEach(function(field) {
                if (field.type) {
                    results[getFieldAs(field)] = self.buildField(field, params);
                } else {
                    _.assign(results, self.buildFields(field.params, field.children, params))
                }
            });

            return results;
        },

        buildField: function(field, parentParams) {
            var target = this.repo[field.type];

            if (!target) {
                throw new Error('[' + field.type + '] not registered');
            }

            if (!field.category) {
                field.category = 'query';
            }


            var handler = target[field.category];

            if (!handler) {
                throw new Error('[' + field.type + '.' + field.category + '] not registered');
            }

            var params = buildContextParams(field.params, parentParams);

            var result = typeof handler === 'function' ? handler(params) : handler;

            if (!field.children || !result) {
                return result;
            }

            return _.isArray(result) ? result.map(function(o) {
                return buildFields(o, field.children, params);
            }) : buildFields(result, field.children, params);
        }
    }
);