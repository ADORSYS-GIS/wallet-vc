/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolvePackage = (relativePath) =>
  path.resolve(appDirectory, relativePath);

const transpileModules = [
  resolvePackage('node_modules/didcomm'),
  resolvePackage('node_modules/did-resolver-lib'),
];

const modifyBabelLoader = (rule) => {
  if (rule.loader && rule.loader.includes('babel-loader')) {
    rule.include = [].concat(rule.include || [], transpileModules);
    if (rule.exclude && rule.exclude instanceof RegExp) {
      const originalExclude = rule.exclude;
      rule.exclude = (filepath) =>
        transpileModules.some((modPath) => filepath.startsWith(modPath))
          ? false
          : originalExclude.test(filepath);
    }
  }
};

// eslint-disable-next-line no-undef
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@adorsys-gis/multiple-did-identities/src': path.resolve(
        // eslint-disable-next-line no-undef
        __dirname,
        'node_modules/@adorsys-gis/multiple-did-identities/dist/src',
      ),
    };

    if (config.module && Array.isArray(config.module.rules)) {
      config.module.rules.forEach((rule) => {
        if (rule.oneOf && Array.isArray(rule.oneOf)) {
          rule.oneOf.forEach(modifyBabelLoader);
        } else {
          modifyBabelLoader(rule);
        }
      });
    }

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
