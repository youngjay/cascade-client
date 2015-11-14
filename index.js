module.exports = {
    // main
    Cascade: require('./lib/cascade'),

    // fetch
    LocalFetcher: require('./lib/fetcher/local'),

    // decorator
    Combiner: require('./lib/fetcher/decorator/combiner'),
    ErrorRejector: require('./lib/fetcher/decorator/error-rejector'),

    // util
    getFieldAs: require('./lib/util/get-field-as')
};