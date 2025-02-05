const path = require('path');
const fs = require('fs');
const cracoBabelLoader = require('craco-babel-loader');

const appDirectory = fs.realpathSync(process.cwd());
const resolvePackage = (relativePath) =>
  path.resolve(appDirectory, relativePath);

module.exports = {
  plugins: [
    {
      plugin: cracoBabelLoader,
      options: {
        includes: [
          resolvePackage('node_modules/package-to-transpile'),
          resolvePackage('node_modules/another-package-to-transpile'),
          resolvePackage('node_modules/didcomm'),
          resolvePackage('node_modules/did-resolver-lib'),
        ],
      },
    },
  ],
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: false,
        buffer: false,
      };

      // Explicitly alias the problematic module path
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@adorsys-gis/multiple-did-identities/src': path.resolve(
          __dirname,
          'node_modules/@adorsys-gis/multiple-did-identities/dist/src',
        ),
      };
      return webpackConfig;
    },
  },
};
