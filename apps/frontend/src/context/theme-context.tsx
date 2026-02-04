'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { generateColorPalette, applyThemeColor } from '@/lib/theme-loader'

interface ThemeContextType {
    themeColor: string
    setThemeColor: (color: string) => void
    updateThemeColors: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const DEFAULT_THEME_COLOR = '#ffd952'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeColor, setThemeColorState] =
        useState<string>(DEFAULT_THEME_COLOR)

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const { fetchSettings } = await import('@/lib/admin/settings')
                const settings = await fetchSettings()
                const color =
                    settings?.app?.themeColor ||
                    localStorage.getItem('theme-color') ||
                    DEFAULT_THEME_COLOR

                setThemeColorState(color)
                updateThemeColors(color)
                if (!settings?.app?.themeColor) {
                    localStorage.setItem('theme-color', color)
                }
            } catch (error) {
                const stored = localStorage.getItem('theme-color')
                if (stored) {
                    setThemeColorState(stored)
                    updateThemeColors(stored)
                } else {
                    updateThemeColors(DEFAULT_THEME_COLOR)
                }
            }
        }

        loadTheme()
    }, [])

    const updateThemeColors = (color: string) => {
        applyThemeColor(color)
    }

    const setThemeColor = (color: string) => {
        setThemeColorState(color)
        localStorage.setItem('theme-color', color)
        updateThemeColors(color)
    }

    return (
        <ThemeContext.Provider
            value={{
                themeColor,
                setThemeColor,
                updateThemeColors,
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
