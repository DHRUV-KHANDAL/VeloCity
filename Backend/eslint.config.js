import globals from 'globals'
import js from '@eslint/js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['node_modules/**', 'dist/**']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        process: 'readonly'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      
      // Custom rules for Node.js
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-process-exit': 'off',
      'no-sync': 'off'
    }
  }
]
