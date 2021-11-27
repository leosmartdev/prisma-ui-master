/*
 * Rules for prisma-electron only. Mostly, these are just turned off because its a lot of errors
 * and an old codebase, so overtime we should turn them and eventually remove this file.
 */
module.exports = {
  rules: {
    'react/jsx-filename-extension': 1,
    'import/prefer-default-export': 1,
    'implicit-arrow-linebreak': 1,
    'react/prefer-stateless-function': 1,
    'react/destructuring-assignment': 1,
    'no-param-reassign': 1,
    'no-unused-expressions': 1,
    'react/no-did-mount-set-state': 0,
    'no-class-assign': 0,
    'react/forbid-prop-types': 0,
    'react/require-default-props': 0,
    'react/no-unused-state': 0,
    'no-use-before-define': 0,
    'react/no-unused-prop-types': 0,
    'react/sort-comp': 0,
    'react/no-multi-comp': 0,
    'react/no-did-update-set-state': 0,
    'no-mixed-operators': 0,
    'prefer-destructuring': 0,
    'prefer-promise-reject-errors': 0,
    'class-methods-use-this': 0,
    eqeqeq: 0,
    'no-shadow': 0,
    'array-callback-return': 0,
    'import/first': 0,
    'import/no-named-as-default': 0,
    'consistent-return': 0,
    'no-restricted-syntax': 0,
    'default-case': 0,
  },
};
