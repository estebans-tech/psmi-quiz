import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default [
  // Ignorera byggartefakter
  { ignores: ['.nuxt/**', 'dist/**', 'node_modules/**', '.output/', '.netlify/', 'scripts/'] },

  // Basrekommendationer
  js.configs.recommended,

  // Vue-rekommendationer (flat)
  ...vue.configs['flat/recommended'],

  // TypeScript-rekommendationer (gäller .ts/.tsx – INTE .vue)
  ...tseslint.configs.recommended,

  // ⬇️ KRITISKT: tala om hur .vue ska parsas
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parser: tseslint.parser, ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off' // eller 'off'
    }
  },

  // (valfritt) explicit för rena TS-filer
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  },

  // Test filer
  {
    files: ['tests/**/*.{ts,vue}', '**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }]
    }
  },

  // Prettier stänger av krockande stilregler
  prettier
]