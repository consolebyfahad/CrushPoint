// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const { expoConfig, env } = require('eslint-config-expo/flat');

module.exports = defineConfig([
  env, {
    node: true,
  },
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
