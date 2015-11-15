var _ = require('lodash');

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
 * cacher 只缓存根节点数据
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
                return target.type === ref.type && (!ref.category || target.category === ref.category);
            });
        },

        getCacheFields: function(fields) {
            var self = this;
            return Promise.all(fields.map(function(field) {
                var typeObj = self.cache[field.type] || (self.cache[field.type] = {});
                var categoryObj = typeObj[field.category] || (typeObj[field.category] = {});
                var paramsKey = generateParamsKey(field.params);
                return categoryObj[paramsKey] || (categoryObj[paramsKey] = self.fetcher.fetch([field]));
            })).then(mergeObjectFromArray);
        }
    }
)