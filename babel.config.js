// Setup the aliases so when developing we can use the same imports as external users would use
const defaultAlias = {
  '@prisma/map': '../prisma-map/src',
  '@prisma/ui': '../prisma-ui/src',
  '@prisma/electron': '../prisma-electron/src',
};

const presets = ['@babel/preset-env', '@babel/preset-react'];

const plugins = [
  '@babel/transform-runtime',
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-syntax-import-meta',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-json-strings',
  [
    'babel-plugin-module-resolver',
    {
      // src here is required for storybook, ./ is for normal babel builds
      root: ['./', './src/'],
      alias: defaultAlias,
    },
  ],
];

const env = {
  test: {
    ignore: [],
    plugins: [
      '@babel/transform-runtime',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-json-strings',
      [
        'babel-plugin-module-resolver',
        {
          root: ['./packages/prisma-electron/src'],
          alias: {
            '@prisma/ui': './packages/prisma-ui/src',
            '@prisma/map': './packages/prisma-map/src',
            '@prisma/electron': './packages/prisma-electron/src',
          },
        },
      ],
    ],
  },
  development: {
    sourceMaps: 'both',
  },
  production: {
    ignore: ['**/*.spec*'],
  },
};

const overrides = [
  {
    test: ['./prisma-electron'],
    plugins: [
      ...plugins,
      [
        'babel-plugin-module-resolver',
        {
          root: ['./packages/prisma-electron/src', './src'],
          alias: defaultAlias,
        },
      ],
    ],
  },
];

module.exports = function(api) {
  api.cache(true);

  return {
    presets,
    plugins,
    env,
  };
};
