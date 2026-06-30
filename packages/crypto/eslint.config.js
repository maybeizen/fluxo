import { fluxoBaseConfig } from '@fluxo/eslint-config'

export default [
    ...fluxoBaseConfig,
    {
        ignores: ['tsup.config.ts'],
    },
]
