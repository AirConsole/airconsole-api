module.exports = {
  env: {
    browser: true
  },
  extends: [
    'plugin:es/restrict-to-es3',
    'plugin:diff/diff'
  ],
  plugins: [
    'es5',
    '@stylistic/js'
  ],
  rules: {
    '@stylistic/js/comma-dangle': ['error', 'never'],
    '@stylistic/js/function-call-spacing': ['error', 'never'],
    '@stylistic/js/no-multi-spaces': ['error'],
    '@stylistic/js/space-unary-ops': ['error', { words: true }],
    '@stylistic/js/switch-colon-spacing': ['error'],
    '@stylistic/js/array-bracket-newline': ['error'],
    '@stylistic/js/function-call-argument-newline': ['error', 'consistent'],
    '@stylistic/js/new-parens': ['error'],
    '@stylistic/js/semi-style': ['error'],
    '@stylistic/js/semi-spacing': ['error'],
    '@stylistic/js/no-extra-semi': ['error'],
    // AirBnB styles
    '@stylistic/js/indent': ['error', 2],
    '@stylistic/js/quotes': ['error', 'double'],
    '@stylistic/js/key-spacing': ['error'],
    '@stylistic/js/keyword-spacing': ['error'],
    '@stylistic/js/object-curly-spacing': ['error', 'always'],
    '@stylistic/js/no-whitespace-before-property': ['error'],
    '@stylistic/js/space-before-blocks': ['error', 'always'],
    '@stylistic/js/space-before-function-paren': ['error', 'never'],
    '@stylistic/js/space-in-parens': ['error'],
    '@stylistic/js/spaced-comment': ['error'],
    '@stylistic/js/function-paren-newline': ['error', 'consistent'],
    '@stylistic/js/object-curly-newline': ['error'],
    'no-new-object': ['error'],
    '@stylistic/js/quote-props': ['error', 'as-needed'],
    'no-array-constructor': ['error'],
    'array-callback-return': ['error', { allowImplicit: true }],
    'func-names': ['warn'],
    '@stylistic/js/max-len': [
      'error', {
        code: 120,
        ignoreUrls: true,
        ignoreStrings: true
      }
    ],
    'no-eval': ['error'],
    'no-useless-escape': ['error'],
    '@stylistic/js/wrap-iife': ['error'],
    'no-loop-func': ['error'],
    'default-param-last': ['error'],
    'no-new-func': ['error'],
    'no-param-reassign': ['error', { props: true }],
    'dot-notation': ['error'],
    'prefer-exponentiation-operator': ['error'],
    'no-multi-assign': ['error'],
    'no-plusplus': ['error'],
    '@stylistic/js/operator-linebreak': ['error', 'before', { overrides: { '=': 'none' } }],
    'no-unused-vars': ['error'],
    'no-use-before-define': ['error'],
    eqeqeq: ['error'],
    'no-case-declarations': ['error'],
    'no-nested-ternary': ['error'],
    'no-unneeded-ternary': ['error'],
    '@stylistic/js/no-mixed-operators': ['error'],
    'nonblock-statement-body-position': ['error'],
    '@stylistic/js/brace-style': ['error'],
    'no-else-return': ['error'],
    'eol-last': ['error'],
    'newline-per-chained-call': ['error'],
    '@stylistic/js/padded-blocks': ['error', 'never'],
    '@stylistic/js/no-multiple-empty-lines': ['error'],
    '@stylistic/js/no-trailing-spaces': ['error'],
    '@stylistic/js/comma-style': ['error'],
    '@stylistic/js/semi': ['error'],
    'no-new-wrappers': ['error'],
    camelcase: ['error'],
    'new-cap': ['error'],
    'no-underscore-dangle': ['error'],
    '@stylistic/js/space-infix-ops': ['error'],
    '@stylistic/js/comma-spacing': ['error'],
    '@stylistic/js/array-bracket-spacing': ['error', 'never', { objectsInArrays: false, arraysInArrays: false }],
    '@stylistic/js/computed-property-spacing': ['error'],
    '@stylistic/js/block-spacing': ['error'],
    'no-undef': ['error']
  }
};
