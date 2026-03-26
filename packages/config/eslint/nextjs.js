// @ts-check
import baseConfig from './base.js'
import tseslint from 'typescript-eslint'

export default tseslint.config(...baseConfig, {
  rules: {
    // Next.js permite exports default sin nombre en páginas
    'import/no-default-export': 'off',
    // React no necesita estar en scope con Next.js 14+
    'react/react-in-jsx-scope': 'off',
  },
})
