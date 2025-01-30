const webpack = require('webpack');

module.exports = {
  webpack: (config) => {
    // Ensure resolve.fallback exists before adding polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
    };

    // Add plugins for providing polyfills to the app
    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ];

    return config;
  },
};
