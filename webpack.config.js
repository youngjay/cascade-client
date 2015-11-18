var webpackConfig = {
    output: {
        path: './dist',
        filename: 'cascade.js',
        library: 'cascade',
        libraryTarget: 'umd'
    },

    entry: './index.js'
};

module.exports = webpackConfig;