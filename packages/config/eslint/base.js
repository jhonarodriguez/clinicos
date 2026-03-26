// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    rules: {
      // No usar any explícito
      '@typescript-eslint/no-explicit-any': 'warn',
      // No variables no usadas (ignora las que empiezan con _)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Preferir tipos sobre interfaces cuando sea posible
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      // Imports de tipos explícitos
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // No usar non-null assertion (!) sin justificación
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.next/**', 'coverage/**'],
  },
)
