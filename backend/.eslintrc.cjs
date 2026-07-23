module.exports = {
  root: true,
  env: { node: true, es2021: true },
  extends: ['eslint:recommended', 'plugin:security/recommended-legacy'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
  plugins: ['security'],
};
