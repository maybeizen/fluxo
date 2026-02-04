import type { Metadata } from 'next'
import { Figtree, Instrument_Sans, Fira_Code } from 'next/font/google'
import './globals.css'
import '../../public/fa/css/all.min.css'
import NotificationProvider from '@/context/notification-context'
import AuthProvider from '@/context/auth-context'
import { ThemeProvider } from '@/context/theme-context'
import ToastContainer from '@/components/ui/toast-container'
import BetaTag from '@/components/ui/beta-tag'
import { themeScript } from '@/lib/theme-script'

const figtree = Figtree({
    variable: '--font-figtree',
    subsets: ['latin'],
    display: 'swap',
    preload: true,
})

const instrumentSans = Instrument_Sans({
    variable: '--font-instrument',
    subsets: ['latin'],
    display: 'swap',
    preload: true,
})

const firaCode = Fira_Code({
    variable: '--font-fira-code',
    subsets: ['latin'],
    display: 'swap',
    preload: false,
})

export const metadata: Metadata = {
    title: 'Fluxo - Unleash Your Minecraft Adventure',
    description:
        'High-performance Minecraft servers, instant setup, and 24/7 support. Create, play, and conquer with Fluxo.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: themeScript,
                    }}
                />
            </head>
            <AuthProvider>
                <ThemeProvider>
                    <NotificationProvider>
                        <body
                            className={`${figtree.variable} ${instrumentSans.variable} ${firaCode.variable} antialiased`}
                            suppressHydrationWarning
                        >
                            <BetaTag />
                            {children}
                            <ToastContainer position="top-right" />
                        </body>
                    </NotificationProvider>
                </ThemeProvider>
            </AuthProvider>
        </html>
    )
}
