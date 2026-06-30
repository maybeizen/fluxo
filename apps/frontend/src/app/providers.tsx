'use client'

import AuthProvider from '@/context/auth-context'
import { ThemeProvider } from '@/context/theme-context'
import NotificationProvider from '@/context/notification-context'
import ToastContainer from '@/components/ui/toast-container'
import BetaTag from '@/components/ui/beta-tag'
import ThemeShell from '@/components/theme-shell'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <NotificationProvider>
                    <BetaTag />
                    <ThemeShell>{children}</ThemeShell>
                    <ToastContainer position="top-right" />
                </NotificationProvider>
            </ThemeProvider>
        </AuthProvider>
    )
}
