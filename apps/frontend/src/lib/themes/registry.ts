import type { ComponentType, ReactNode } from 'react'
import type { ThemeTokens } from '@fluxo/forge'
import defaultManifest from '../../../assets/themes/default/theme.json'
import oceanManifest from '../../../assets/themes/ocean/theme.json'
import DefaultThemeLayout from '../../../assets/themes/default/layout'
import OceanThemeLayout from '../../../assets/themes/ocean/layout'
import { defaultTokens } from '../../../assets/themes/default/tokens'
import { oceanTokens } from '../../../assets/themes/ocean/tokens'

import '../../../assets/themes/default/theme.css'
import '../../../assets/themes/ocean/theme.css'

export interface ThemeDefinition {
    id: string
    name: string
    version: string
    author: string
    description?: string
    layout: ComponentType<{ children: ReactNode }>
    tokens: ThemeTokens
}

const themeRegistry: Record<string, ThemeDefinition> = {
    default: {
        id: defaultManifest.id,
        name: defaultManifest.name,
        version: defaultManifest.version,
        author: defaultManifest.author,
        description: defaultManifest.description,
        layout: DefaultThemeLayout,
        tokens: defaultTokens,
    },
    ocean: {
        id: oceanManifest.id,
        name: oceanManifest.name,
        version: oceanManifest.version,
        author: oceanManifest.author,
        description: oceanManifest.description,
        layout: OceanThemeLayout,
        tokens: oceanTokens,
    },
}

export function listThemes(): ThemeDefinition[] {
    return Object.values(themeRegistry)
}

export function getTheme(id: string): ThemeDefinition {
    return themeRegistry[id] ?? themeRegistry.default
}
