module.exports = require('mixin').extend(
    /**
     * 
     * @param  {[type]} cascade [description]
     * @param  {[type]} config  
     * {
     *     User: true,
     *     Shop: ['query', 'id']
     * }
     */
    function(cascade, config) {
        this.cascade = cascade;
        this.cache = {
            Book: {
                query: {
                    '{}': 1
                }
            }
        };
    },
    {
        execute: function(fields) {
            this.markNeedReload(fields);
            console.log(JSON.stringify(fields, null, 4))
        },

        markNeedReload: function(fields) {
            var self = this;

            fields.forEach(function(field) {
                self.markNeedReload(field.children);

                var needReload = field.children.some(function(child) {
                    return child.needReload;
                });

                if (!needReload) {
                    needReload = self.isNeedReload(field)
                }

                field.needReload = needReload;
            })
        },

        isNeedReload: function(field) {
            var o1 = this.cache[field.type];

            if (!o1) {
                return true;
            }

            var o2 = o1[field.category];

            if (!o2) {
                return true;
            }

            var o3 = o2[JSON.stringify(field.params)];

            if (!o3) {
                return true;
            }

            return false;
        }
    }
)