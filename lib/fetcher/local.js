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
                    resolve(self.processFields({}, _.cloneDeep(fields), false));
                } catch(e) {
                    reject(e);
                }
            })
        },

        processFields: function(results, fields, isInherited) {
            var self = this;

            if (results != null) {
                if (typeof results !== 'object' && fields.length) {
                    results = {
                        __id__: results
                    }
                }

                fields.forEach(function(field) {
                    if (!field.inherit || isInherited) {
                        // field.parent = parent;
                        field.results = results;
                        results[getFieldAs(field)] = self.processField(field);                        
                    } else {
                        var prop = results[field.inherit]
                        results[field.inherit] = self.dispatchResult(prop, [field], true)                        
                    }
                });
            }              

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

            if (!field.children) {
                return result;
            }

            return this.dispatchResult(result, field.children, false)
        },

        dispatchResult: function(result, fields, isInherited) {
            var self = this;
            return _.isArray(result) ? result.map(function(o) {
                return self.processFields(o, fields, isInherited);
            }) : self.processFields(result, fields, isInherited);
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