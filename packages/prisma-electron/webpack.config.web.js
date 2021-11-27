const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const APP_DIR = path.resolve(__dirname, 'src');
const WEB_DIR = path.resolve(__dirname, 'dist', 'web');
const RESOURCES_DIR = path.resolve(__dirname, 'dist', 'web', 'resources');
const WEB_INDEX = path.resolve(__dirname, 'dist', 'web', 'index.html');

const baseConfig = {
  context: APP_DIR,
  entry: './web-app.js',
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      APP_DIR,
    ],
  },
  output: {
    path: WEB_DIR,
    filename: 'web.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      { test: /\.css$/, loader: 'ignore-loader' },
      { test: /\.html$/, loader: 'file-loader' },
      { test: /\.svg$/, loader: 'ignore-loader' },
      { test: /\.png$/, loader: 'ignore-loader' },
      { test: /\.jpg$/, loader: 'ignore-loader' },
      { test: /\.ttf$/, loader: 'ignore-loader' },
      { test: /\.otf$/, loader: 'ignore-loader' },
      { test: /\.po$/, loader: 'ignore-loader' },
      { test: /\.json$/, loader: 'ignore-loader' },
      { test: /\.map$/, loader: 'ignore-loader' },
      { test: /\.txt$/, loader: 'ignore-loader' },
      { test: /\.md$/, loader: 'ignore-loader' },
    ],
  },
  externals: [nodeExternals()],
  devServer: {
    contentBase: WEB_DIR,
    compress: true,
    port: 9000,
    hot: false,
    proxy: {
      '/api/v2/auth/': {
        target: 'https://localhost:8181',
        secure: false,
      },
      '/api/v2/': {
        target: 'https://localhost:8080',
        secure: false,
      },
    },
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'resources', to: RESOURCES_DIR },
      { from: 'web-app.html', to: WEB_INDEX },
      { from: '../node_modules/font-awesome/css/font-awesome.min.css', to: WEB_DIR },
      { from: '../node_modules/flag-icon-css/css/flag-icon.min.css', to: WEB_DIR },
      { from: '../node_modules/openlayers/css/ol.css', to: WEB_DIR },
    ]),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

module.exports = baseConfig;

