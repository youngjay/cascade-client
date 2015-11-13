var mixin = require('mixin-class');
var _ = require('lodash');
var getFieldAs = require('../../util/get-field-as');

var FetchAction = mixin(
    function(fields, resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;

        this.fieldMappings = this.buildFieldMappings(fields);
    },
    {
        buildFieldMappings: function(fields) {
            return fields.map(function(field) {
                var originAs = getFieldAs(field);
                field.as = _.uniqueId('combiner');
                return {
                    as: field.as,
                    originAs: originAs,
                    field: field
                }
            })
        },

        getMappedFields: function() {
            return this.fieldMappings.map(function(mapping) {
                return mapping.field;
            })
        },

        pick: function(data) {
            this.resolve(this.fieldMappings.reduce(function(ret, mapping) {
                ret[mapping.originAs] = data[mapping.as];  
                return ret;
            }, {}));
        }
    }
);

module.exports = require('./base').extend(
    function(fetcher, options) {
        this.pendingActions = [];
        this.actionTimeoutHandle = 0;
        this.options = _.assign({}, this.options, options);
    },
    {
        options: {
            throttlePeriod: 500
        },

        fetch: function(fields) {
            var self = this;
            return new Promise(function(resolve, reject) {
                self.enqueue(new FetchAction(fields, resolve, reject));
            });
        },

        enqueue: function(fetchAction) {
            this.pendingActions.push(fetchAction);
            clearTimeout(this.actionTimeoutHandle);

            var self = this;       
            this.actionTimeoutHandle = setTimeout(function() {  
                self.dequeue();
            }, this.options.throttlePeriod);
        },

        dequeue: function() {
            var actions = this.pendingActions.slice();
            var fields = actions.reduce(function(all, action) {
                return all.concat(action.getMappedFields());
            }, []);

            this.fetcher.fetch(fields).then(function(data) {
                actions.forEach(function(action) {
                    action.pick(data);
                });
            }).catch(function(error) {
                actions.forEach(function(action) {
                    action.reject(error);
                });
            });
        }
    }
);