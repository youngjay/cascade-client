module.exports = function(promise, done, f ) {
    promise.then(function(o) {
        try {
            f(o)
            done()
        } catch( e ) {
            done( e )
        }
    }).catch(function(e) {
        done(e);
    });
}