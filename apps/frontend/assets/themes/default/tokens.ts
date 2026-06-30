import type { ThemeTokens } from '@fluxo/forge'

export const defaultTokens: ThemeTokens = {
    colors: {
        background: '#111111',
        foreground: '#fafafa',
        primary: '#ffd952',
        surface: '#09090b',
        border: '#27272a',
        muted: '#a1a1aa',
    },
    fonts: {
        sans: 'Instrument Sans, sans-serif',
        mono: 'Fira Code, monospace',
    },
    cssVars: {
        '--color-primary-400': '#ffd952',
        '--color-primary-500': '#ffce1f',
    },
}
