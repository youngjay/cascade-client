var mixin = require('mixin-class');
var _ = require('lodash');
var getFieldAs = require('../util/get-field-as');

var FetchAction = mixin(
    function FetchAction(fields, resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;

        this.fieldMappings = this.buildFieldMappings(fields);
    },
    {
        buildFieldMappings: function(fields) {
            return fields.map(function(field) {
                var originAs = getFieldAs(field);
                var newAs = _.uniqueId('combiner');
                return {
                    as: newAs,
                    originAs: originAs,
                    field: _.assign({}, field, {
                        as: newAs
                    })
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

module.exports = mixin(
    require('./base'),
    function Combiner() {
        this.pendingActions = [];
        this.actionTimeoutHandle = 0;
        this.dequeue = this.dequeue.bind(this);
    },
    {
        options: {
            wait: 300
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
            this.actionTimeoutHandle = setTimeout(this.dequeue, this.options.wait);
        },

        dequeue: function() {
            var actions = this.pendingActions.slice();
            this.pendingActions.length = 0;

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