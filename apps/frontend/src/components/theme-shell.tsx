'use client'

import { getTheme } from '@/lib/themes/registry'
import { useThemeTokens } from '@/hooks/use-theme-tokens'

const DEFAULT_THEME_ID = 'default'

export default function ThemeShell({
    children,
}: {
    children: React.ReactNode
}) {
    useThemeTokens(DEFAULT_THEME_ID)

    const theme = getTheme(DEFAULT_THEME_ID)
    const Layout = theme.layout

    return <Layout>{children}</Layout>
}
