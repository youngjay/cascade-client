module.exports = {
    // fetch
    LocalFetcher: require('./lib/fetcher/local'),

    // decorator
    Combiner: require('./lib/decorator/combiner'),
    ErrorRejector: require('./lib/decorator/error-rejector'),
    Cacher: require('./lib/decorator/cacher'),
    Normalizer: require('./lib/decorator/normalizer'),
    Logger: require('./lib/decorator/logger'),
    Delayer: require('./lib/decorator/delayer'),

    // util
    getFieldAs: require('./lib/util/get-field-as')
};