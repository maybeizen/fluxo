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

    const lighten = (amount: number) => {
        return {
            r: Math.min(255, Math.round(r + (255 - r) * amount)),
            g: Math.min(255, Math.round(g + (255 - g) * amount)),
            b: Math.min(255, Math.round(b + (255 - b) * amount)),
        }
    }

    const darken = (amount: number) => {
        return {
            r: Math.max(0, Math.round(r * (1 - amount))),
            g: Math.max(0, Math.round(g * (1 - amount))),
            b: Math.max(0, Math.round(b * (1 - amount))),
        }
    }

    const toHex = (color: { r: number; g: number; b: number }) => {
        return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`
    }

    const primary400Text = getContrastTextColor(r, g, b)
    const primary500 = darken(0.1)
    const primary500Text = getContrastTextColor(
        primary500.r,
        primary500.g,
        primary500.b
    )

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
        '--color-primary-400-text': primary400Text,
        '--color-primary-500-text': primary500Text,
    }
}

export function applyThemeColor(color: string) {
    if (typeof document === 'undefined') return

    const palette = generateColorPalette(color)
    const root = document.documentElement

    Object.entries(palette).forEach(([key, value]) => {
        root.style.setProperty(key, value)
    })
}
