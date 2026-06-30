'use client'

import { useEffect } from 'react'
import { getTheme } from '@/lib/themes/registry'
import { applyThemeTokens } from '@/lib/theme-loader'

export function useThemeTokens(themeId: string) {
    useEffect(() => {
        const theme = getTheme(themeId)
        applyThemeTokens(theme.tokens, themeId)
    }, [themeId])
}
