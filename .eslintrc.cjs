module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    // 'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    // 'plugin:@typescript-eslint/all', // https://typescript-eslint.io/users/configs/#all

    'plugin:react-hooks/recommended',
    'plugin:react/recommended',

    // "If you are using the new JSX transform from React 17, extend react/jsx-runtime in your
    // eslint config (add "plugin:react/jsx-runtime" to "extends") to disable the relevant rules"
    // needed so you don't have to import React in files with JSX — a React 17 feature
    // https://github.com/jsx-eslint/eslint-plugin-react#configuration-legacy-eslintrc-
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },

    // https://github.com/import-js/eslint-plugin-import#typescript
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
}
