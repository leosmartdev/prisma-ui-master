import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import pkg from './package.json';

const external = [
  'react',
  'react-dom',
  'react-map-gl',
  'mapbox-gl',
  'mapbox-gl-draw',
  '@turf/turf',
  '@material-ui/core',
];

const resolveOptions = {
  extensions: ['.js', '.jsx', '.json'],
  browser: true,
  customResolveOptions: {
    moduleDirectory: ['node_modules', '../../node_modules'],
  },
};

const commonjsOptions = {
  include: /node_modules/,
  namedExports: {
    '../../node_modules/mapbox-gl/dist/mapbox-gl.js': ['FullscreenControl'],
    '../../node_modules/@turf/turf': ['center'],
    'node_modules/@material-ui/core/styles/index.js': ['withStyles'],
  },
};

const babelOptions = {
  root: '../../',
  exclude: /node_modules/,
  runtimeHelpers: true,
};

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: pkg.productName,
      globals: {
        react: 'React',
        'mapbox-gl': 'mapboxgl',
        '@turf/turf': 'turf',
      },
    },
    external,
    plugins: [
      // FIXME: These rules were causing pages worth of linting warnings and
      // errors. Disabled for now until those can be fixed.
      // eslint(),
      builtins(),
      postcss(),
      resolve(resolveOptions),
      babel(babelOptions),
      commonjs(commonjsOptions),
      sizeSnapshot(),
      terser(),
    ],
  },
  // Common JS build
  /* Babel now being called directly for this.
  {
    input: 'src/index.js',
    output: { file: pkg.main, format: 'cjs' },
    external,
    plugins: [
      builtins(),
      postcss(),
      resolve(resolveOptions),
      babel(babelOptions),
      commonjs(commonjsOptions),
      sizeSnapshot(),
    ],
  },
  */
  // ES6 modules
  {
    input: 'src/index.js',
    output: { file: pkg.module, format: 'es' },
    external,
    plugins: [
      builtins(),
      postcss(),
      resolve(resolveOptions),
      babel(babelOptions),
      commonjs(commonjsOptions),
    ],
  },
];
