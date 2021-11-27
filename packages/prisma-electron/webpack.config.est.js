const path = require('path');
const nodeExternals = require('webpack-node-externals');

const TEST_DIR = path.resolve(__dirname, 'test_old');
const APP_DIR = path.resolve(__dirname, 'src');

const config = {
  context: TEST_DIR,
  entry: './index.js',
  output: {
    path: TEST_DIR,
    filename: 'bundleTest.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      { test: /\.css$/, loader: 'ignore-loader' },
      { test: /\.html$/, loader: 'ignore-loader' },
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
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      APP_DIR,
      TEST_DIR,
    ],
  },
  target: 'electron-renderer',
  externals: [nodeExternals()],
  node: {
    __filename: true,
    __dirname: true,
  },
};

module.exports = config;
