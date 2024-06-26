module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:sonarjs/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prop-types': ['off'],
    'sonarjs/cognitive-complexity': ['error', 30],
    'sonarjs/no-identical-functions': ['error', 5],
  },
};
