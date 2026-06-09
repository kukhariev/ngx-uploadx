// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export default defineConfig(
  {
    ignores: ['vitest.config.ts']
  },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.eslint.json']
      }
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@angular-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
      // Deprecated, will be removed in eslint v11
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'app',
          style: 'kebab-case',
          type: 'element'
        }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'uploadx',
          style: 'camelCase',
          type: 'attribute'
        }
      ]
    }
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended]
  },
  prettier
);
