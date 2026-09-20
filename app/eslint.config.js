import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import solid from 'eslint-plugin-solid'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ...solid.configs['flat/typescript'],
  },
)
