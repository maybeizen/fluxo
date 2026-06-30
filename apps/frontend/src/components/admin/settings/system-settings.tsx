'use client'

import React from 'react'
import Checkbox from '@/components/ui/input/checkbox'
import InputLabel from '@/components/ui/input/input-label'
import TextArea from '@/components/ui/input/text-area'

interface SystemSettingsProps {
    formData: {
        ticketsEnabled: boolean
        maintenanceMode: boolean
        maintenanceMessage: string
        debugMode: boolean
        announcementEnabled: boolean
        announcementMessage: string
    }
    onChange: (data: Partial<SystemSettingsProps['formData']>) => void
}

export default function SystemSettings({
    formData,
    onChange,
}: SystemSettingsProps) {
    return (
        <div className="border-t border-zinc-800 pt-8">
            <h2 className="mb-6 text-xl font-semibold text-white">
                System Toggles
            </h2>
            <div className="space-y-6">
                <Checkbox
                    id="ticketsEnabled"
                    checked={formData.ticketsEnabled}
                    onChange={(e) =>
                        onChange({ ticketsEnabled: e.target.checked })
                    }
                    label="Enable support tickets"
                />

                <Checkbox
                    id="maintenanceMode"
                    checked={formData.maintenanceMode}
                    onChange={(e) =>
                        onChange({ maintenanceMode: e.target.checked })
                    }
                    label="Maintenance mode (blocks non-admin access)"
                />
                {formData.maintenanceMode && (
                    <div>
                        <InputLabel htmlFor="maintenanceMessage">
                            Maintenance message
                        </InputLabel>
                        <TextArea
                            id="maintenanceMessage"
                            value={formData.maintenanceMessage}
                            onChange={(e) =>
                                onChange({
                                    maintenanceMessage: e.target.value,
                                })
                            }
                            placeholder="We are performing scheduled maintenance..."
                            rows={3}
                        />
                    </div>
                )}

                <Checkbox
                    id="debugMode"
                    checked={formData.debugMode}
                    onChange={(e) => onChange({ debugMode: e.target.checked })}
                    label="Debug mode (verbose logging and detailed API errors)"
                />

                <Checkbox
                    id="announcementEnabled"
                    checked={formData.announcementEnabled}
                    onChange={(e) =>
                        onChange({ announcementEnabled: e.target.checked })
                    }
                    label="Show site-wide announcement banner"
                />
                {formData.announcementEnabled && (
                    <div>
                        <InputLabel htmlFor="announcementMessage">
                            Announcement message
                        </InputLabel>
                        <TextArea
                            id="announcementMessage"
                            value={formData.announcementMessage}
                            onChange={(e) =>
                                onChange({
                                    announcementMessage: e.target.value,
                                })
                            }
                            placeholder="Important notice for all users..."
                            rows={2}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
