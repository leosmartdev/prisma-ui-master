const path = require('path');
const nodeExternals = require('webpack-node-externals');

const APP_DIR = path.resolve(__dirname, 'src');
const ELECTRON_DIR = path.resolve(__dirname, 'main');
const BUILD_DIR = path.resolve(__dirname, 'dist');

const baseConfig = {
  context: APP_DIR,
  entry: './app.js',
  output: {
    path: APP_DIR,
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [APP_DIR],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          rootMode: 'upward',
        },
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
  externals: [
    nodeExternals(),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules'),
    }),
  ],
  node: {
    __filename: true,
    __dirname: true,
  },
};

const electronRendererConfig = {
  ...baseConfig,
  target: 'electron-renderer',
};

const webConfig = {
  ...baseConfig,
  target: 'web',
  entry: './web-app.js',
  output: {
    path: BUILD_DIR,
    filename: 'web.bundle.js',
  },
};

const electronMainConfig = {
  ...baseConfig,
  context: ELECTRON_DIR,
  entry: './main.js',
  target: 'electron-main',
  output: {
    path: BUILD_DIR,
    filename: 'electron-main.bundle.js',
  },
  resolve: {
    extensions: ['.js'],
    modules: [ELECTRON_DIR],
  },
};

module.exports = {
  baseConfig,
  electronRendererConfig,
  electronMainConfig,
  webConfig,
};
