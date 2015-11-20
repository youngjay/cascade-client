module.exports = {
    // main
    Cascade: require('./lib/cascade'),

    // fetch
    LocalFetcher: require('./lib/fetcher/local'),

    // decorator
    Combiner: require('./lib/decorator/combiner'),
    ErrorRejector: require('./lib/decorator/error-rejector'),
    Cacher: require('./lib/decorator/cacher'),

    // util
    getFieldAs: require('./lib/util/get-field-as')
};