module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    jest: true,
  },

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['**/*.js'],
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['**/*.{ts,tsx}'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      },
    },

    {
      files: ['**/*.test.ts', '**/*.test.js'],
      extends: ['@metamask/eslint-config-jest'],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          { allow: ['describe', 'expect', 'it'] },
        ],
      },
    },
  ],

  ignorePatterns: [
    '!.prettierrc.js',
    '**/!.eslintrc.js',
    '**/dist*/',
    '**/docs*/',
    '**/*__GENERATED__*',
    '**/build',
    '**/public',
    '**/.cache',
    '**/truffle',
  ],
};
