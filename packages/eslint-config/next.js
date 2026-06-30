import { fluxoBaseConfig } from './base.js'

/** ESLint config for Next.js apps (extends base; add next plugin in app config) */
export const fluxoNextConfig = [
    ...fluxoBaseConfig,
    {
        files: ['**/*.tsx', '**/*.ts'],
        rules: {
            '@next/next/no-html-link-for-pages': 'off',
        },
    },
]

export default fluxoNextConfig
