const { electronRendererConfig } = require('./webpack.config');
const merge = require('webpack-merge');

const baseDevelopmentConfig = {
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
// FIXME: These rules were causing pages worth of linting warnings and
// errors. Disabled for now until those can be fixed.
      { /*
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        */
      },
    ],
  },
  optimization: {
    minimize: false,
  },
};

module.exports = [merge(electronRendererConfig, baseDevelopmentConfig)];
