module.exports = require('./api').extend(
    function(url, fetcher) {
        this.url = url;
        this.fetcher = fetcher;
    },
    {
        query: function(fields) {
            return this.fetcher(this.url, fields);
        }
    }
);