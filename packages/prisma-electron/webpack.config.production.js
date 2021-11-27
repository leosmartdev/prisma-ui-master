const configs = require('./webpack.config');
const merge = require('webpack-merge');

const electronRendererConfig = merge(configs.electronRendererConfig, {
  devtool: 'none',
  mode: 'production',

  optimization: {
    minimize: true,
  },
});

module.exports = electronRendererConfig;
