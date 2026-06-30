import tseslint from '@typescript-eslint/eslint-plugin'
import { fluxoBaseConfig } from './base.js'

/** Type-aware ESLint config for Node / library packages */
export const fluxoNodeConfig = [
    ...fluxoBaseConfig,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            ...tseslint.configs['recommended-type-checked'].rules,
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/require-await': 'warn',
        },
    },
]

export default fluxoNodeConfig
