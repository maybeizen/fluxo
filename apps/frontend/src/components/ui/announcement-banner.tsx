'use client'

import { useAppSettings } from '@/context/app-settings-context'

export default function AnnouncementBanner() {
    const { announcementEnabled, announcementMessage, isLoading } =
        useAppSettings()

    if (isLoading || !announcementEnabled || !announcementMessage) {
        return null
    }

    return (
        <div className="border-b border-amber-900/50 bg-amber-950/40 px-4 py-2 text-center text-sm text-amber-100">
            <i className="fas fa-bullhorn mr-2 text-amber-400" />
            {announcementMessage}
        </div>
    )
}
