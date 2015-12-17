var _ = require('lodash');

var getFieldAs = require('../util/get-field-as');

module.exports = require('mixin-class')(
    function LocalFetcher(repo) {
        this.repo = repo;
    },
    {
        fetch: function(fields) {
            var self = this;

            return new Promise(function(resolve, reject) {
                try {
                    resolve(self.processFields({}, _.cloneDeep(fields), null));
                } catch(e) {
                    reject(e);
                }
            })
        },

        processFields: function(results, fields, parent) {
            var self = this;     

            fields.forEach(function(field) {
                if (field.type) {
                    field.parent = parent;
                    results[getFieldAs(field)] = self.processField(field);
                } else {
                    var p = _.cloneDeep(parent);
                    _.assign(p.params, field.params);
                    self.processFields(results, field.children, p);
                }
            });

            return results;
        },

        processField: function(field) {
            var result;

            try {
                result = this.invoke(field);
            } catch (e) {
                return '[Cascade Error] ' + e;
            }

            var self = this;

            if (!field.children || !result) {
                return result;
            }

            return _.isArray(result) ? result.map(function(o) {
                return self.processFields(o, field.children, field);
            }) : self.processFields(result, field.children, field);
        },

        invoke: function(field) {

            var target = this.repo[field.type];

            if (!target) {
                throw new Error('[' + field.type + '] not registered');
            }

            var handler = target[field.category];

            if (handler === undefined) {
                throw new Error('[' + field.type + '.' + field.category + '] not registered');
            }

            return typeof handler === 'function' ? handler(field) : _.cloneDeep(handler);
        }
    }
);