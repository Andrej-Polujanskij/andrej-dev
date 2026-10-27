import prettier from 'eslint-config-prettier';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(prettier, {
  rules: {
    'func-style': ['error', 'expression'],
    'prefer-arrow-callback': 'error',
    'no-console': 'error',
    'vue/require-default-prop': 'off',
  },
});
