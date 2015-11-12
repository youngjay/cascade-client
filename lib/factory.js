var LocalCascade = require('./cascade/local');
var RemoteCascade = require('./cascade/remote');

var factory = {
    fromLocal: function(repo) {
        return new LocalCascade(repo);
    },

    fromRemote: function(url, fetcher) {
        return new RemoteCascade(repo);
    }
};

module.exports = factory;