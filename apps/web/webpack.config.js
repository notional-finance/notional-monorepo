const webpack = require('webpack');
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(
  // Default Nx composable plugin
  withNx(),
  // Custom composable plugin
  (config) => {
    if (!config.resolve) {
      config.resolve = {
        fallback: {},
      };
    }

    config.resolve.fallback = {
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      events: require.resolve('events/'),
      fs: false,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      path: require.resolve('path-browserify'),
      process: require.resolve('process/browser'),
      punycode: require.resolve('punycode/'),
      querystring: require.resolve('querystring-es3'),
      url: require.resolve('url/'),
      timers: require.resolve('timers-browserify'),
      stream: require.resolve('stream-browserify'),
      os: require.resolve('os-browserify/browser'),
      zlib: require.resolve('browserify-zlib'),
      vm: false,
    };

    config.experiments = {
      asyncWebAssembly: true,
    };

    config.node = {
      global: true,
    };

    if (!config.module || !config.module.rules) {
      config.module = {
        rules: [],
      };
    }

    config.module.rules.push({
      test: /\.(svg|png|jpe?g|gif|webp|woff|ttf|otf|wav|mp3|ico|zip)$/,
      type: 'asset/resource',
    });

    if (!config.plugins) {
      config.plugins = [];
    }

    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      })
    );

    return config;
  }
);
