import { fluxoConfig } from '@fluxo/eslint-config'

export default [
    ...fluxoConfig,
    {
        ignores: ['node_modules/**', 'dist/**', 'build/**', '.turbo/**'],
    },
]
