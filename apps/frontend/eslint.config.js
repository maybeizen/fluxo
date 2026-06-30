import { fluxoBaseConfig } from '@fluxo/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
    ...fluxoBaseConfig,
    {
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts',
        ],
    },
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-hooks/set-state-in-effect': 'off',
        },
    },
]
