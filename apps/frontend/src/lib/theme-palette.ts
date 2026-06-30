import type { ThemeTokens } from '@fluxo/forge'

export const DEFAULT_THEME_COLOR = '#ffd952'

function calculateLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((val) => {
        val = val / 255
        return val <= 0.03928
            ? val / 12.92
            : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastTextColor(r: number, g: number, b: number): string {
    const luminance = calculateLuminance(r, g, b)
    return luminance > 0.5 ? '#000000' : '#ffffff'
}

export function generateColorPalette(
    baseColor: string
): Record<string, string> {
    const hexToRgb = (
        hex: string
    ): { r: number; g: number; b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : null
    }

    const rgb = hexToRgb(baseColor)
    if (!rgb) return {}

    const { r, g, b } = rgb

    const lighten = (amount: number) => ({
        r: Math.min(255, Math.round(r + (255 - r) * amount)),
        g: Math.min(255, Math.round(g + (255 - g) * amount)),
        b: Math.min(255, Math.round(b + (255 - b) * amount)),
    })

    const darken = (amount: number) => ({
        r: Math.max(0, Math.round(r * (1 - amount))),
        g: Math.max(0, Math.round(g * (1 - amount))),
        b: Math.max(0, Math.round(b * (1 - amount))),
    })

    const toHex = (color: { r: number; g: number; b: number }) =>
        `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`

    const primary500 = darken(0.1)

    return {
        '--color-primary-50': toHex(lighten(0.95)),
        '--color-primary-100': toHex(lighten(0.9)),
        '--color-primary-200': toHex(lighten(0.75)),
        '--color-primary-300': toHex(lighten(0.5)),
        '--color-primary-400': baseColor,
        '--color-primary-500': toHex(primary500),
        '--color-primary-600': toHex(darken(0.25)),
        '--color-primary-700': toHex(darken(0.4)),
        '--color-primary-800': toHex(darken(0.55)),
        '--color-primary-900': toHex(darken(0.7)),
        '--color-primary-950': toHex(darken(0.85)),
        '--color-primary-400-text': getContrastTextColor(r, g, b),
        '--color-primary-500-text': getContrastTextColor(
            primary500.r,
            primary500.g,
            primary500.b
        ),
    }
}

export function applyCssVars(vars: Record<string, string>) {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
    })
}

export function applyThemeColor(color: string) {
    applyCssVars(generateColorPalette(color))
}

export function applyThemeTokens(tokens: ThemeTokens, themeId?: string) {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    if (themeId) {
        root.setAttribute('data-theme', themeId)
    }

    const vars: Record<string, string> = {}

    if (tokens.colors) {
        if (tokens.colors.background)
            vars['--color-background'] = tokens.colors.background
        if (tokens.colors.foreground)
            vars['--color-foreground'] = tokens.colors.foreground
        if (tokens.colors.primary)
            vars['--color-primary-400'] = tokens.colors.primary
        if (tokens.colors.surface)
            vars['--color-surface'] = tokens.colors.surface
        if (tokens.colors.border) vars['--color-border'] = tokens.colors.border
        if (tokens.colors.muted) vars['--color-muted'] = tokens.colors.muted
    }

    if (tokens.fonts?.sans) vars['--font-sans'] = tokens.fonts.sans
    if (tokens.fonts?.mono) vars['--font-mono'] = tokens.fonts.mono

    if (tokens.cssVars) {
        Object.assign(vars, tokens.cssVars)
    }

    applyCssVars(vars)

    if (tokens.colors?.primary) {
        applyCssVars(generateColorPalette(tokens.colors.primary))
    }
}

export function buildThemeBootstrapScript(): string {
    const paletteJson = JSON.stringify(
        generateColorPalette(DEFAULT_THEME_COLOR)
    )
    return `(function(){try{var DEFAULT=${JSON.stringify(DEFAULT_THEME_COLOR)};var PALETTE=${paletteJson};function apply(p){var r=document.documentElement;Object.keys(p).forEach(function(k){r.style.setProperty(k,p[k]);});}var s=localStorage.getItem('theme-color');if(s){apply(generateFrom(s));}else{apply(PALETTE);}function generateFrom(c){var o=Object.assign({},PALETTE);o['--color-primary-400']=c;return o;}}catch(e){}})();`
}
