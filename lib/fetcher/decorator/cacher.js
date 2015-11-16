var _ = require('lodash');
var getFieldAs = require('../../util/get-field-as');

var mergeObjectFromArray = function(arr) {
    return _.assign.apply(_, [{}].concat(arr));
};

var generateParamsKey = function(params) {
    return JSON.stringify(Object.keys(params).sort().reduce(function(ret, key) {
        ret[key] = params[key];
        return ret;
    }, {}));
};

/**
 * cacher 只缓存没有children的根节点数据
 */
module.exports = require('./base').extend(
    function() {
        this.cache = {};
    },
    {
        options: {
            /**
             * 需要缓存的fields
             * @type {Array}
             * [
             *     // cache User.query
             *     {
             *         type: 'User',
             *         category: 'query'
             *     },
             *     // cache User.*
             *     {
             *         type: 'User'
             *     }
             * ]
             */
            fields: []
        },

        fetch: function(fields) {
            var matchCacheFields = [];
            var unmatchCacheFields = [];
            var self = this;
            
            fields.forEach(function(field) {
                if (self.isMatch(field)) {
                    matchCacheFields.push(field);
                } else {
                    unmatchCacheFields.push(field);
                }
            });

            return Promise.all([this.getCacheFields(matchCacheFields), this.fetcher.fetch(unmatchCacheFields)]).then(mergeObjectFromArray);
        },

        isMatch: function(target) {
            return this.options.fields.some(function(ref) {
                return target.type === ref.type && (!ref.category || target.category === ref.category) && !target.children.length;
            });
        },

        getCacheFields: function(fields) {
            var self = this;
            return Promise.all(fields.map(function(field) {
                var as = getFieldAs(field);
                var typeObj = self.cache[field.type] || (self.cache[field.type] = {});
                var categoryObj = typeObj[field.category] || (typeObj[field.category] = {});
                var paramsKey = generateParamsKey(field.params);
                var cacheObj = categoryObj[paramsKey] || (categoryObj[paramsKey] = self.fetcher.fetch([field]).then(function(data) {
                    return data[as];
                }));
                return cacheObj.then(function(data) {
                    var ret = {};
                    ret[as] = data;
                    return ret;
                })
            })).then(mergeObjectFromArray);
        }
    }
)