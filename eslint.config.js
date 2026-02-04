import netherhostConfig from '@fluxo/eslint-config'

export default [
    ...netherhostConfig,
    {
        ignores: ['node_modules/**', 'dist/**', 'build/**', '.turbo/**'],
    },
]
