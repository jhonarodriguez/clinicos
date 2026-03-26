// @ts-check
import baseConfig from './base.js'
import tseslint from 'typescript-eslint'

export default tseslint.config(...baseConfig, {
  rules: {
    // NestJS usa decoradores que generan clases vacías aparentemente
    '@typescript-eslint/no-extraneous-class': 'off',
    // NestJS usa interfaces vacías para tokens de inyección
    '@typescript-eslint/no-empty-interface': 'off',
    // Permitir require() en archivos de configuración de NestJS
    '@typescript-eslint/no-require-imports': 'off',
  },
})
