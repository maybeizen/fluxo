'use client'

import React from 'react'
import { User } from '@fluxo/types'
import Button from '@/components/ui/button'

interface CommunityCardProps {
    user: User
    isDiscordConnected: boolean
    isDisconnecting: boolean
    onDiscordConnect: () => void
    onDiscordDisconnect: () => void
}

export default function CommunityCard({
    isDiscordConnected,
    isDisconnecting,
    onDiscordConnect,
    onDiscordDisconnect,
    user,
}: CommunityCardProps) {
    return (
        <div className="flex flex-col rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white">Community</h3>
            <p className="mb-6 text-sm text-zinc-400">
                Stay connected with the Fluxo community and get the latest news
                and updates.
            </p>

            <div className="flex flex-col gap-2">
                {isDiscordConnected ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded-lg border border-[#5865F2]/30 bg-[#5865F2]/10 p-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#5865F2]">
                                <i className="fab fa-discord text-sm text-white"></i>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-zinc-400">
                                    Connected as
                                </p>
                                <p className="truncate text-sm font-medium text-white">
                                    {user.discord?.discordUsername}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            fullWidth
                            icon="fas fa-unlink"
                            iconPosition="left"
                            onClick={onDiscordDisconnect}
                            loading={isDisconnecting}
                        >
                            {isDisconnecting
                                ? 'Disconnecting...'
                                : 'Disconnect'}
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="custom"
                        fullWidth
                        icon="fab fa-discord"
                        iconPosition="left"
                        className="border-[#5865F2] bg-[#5865F2] hover:bg-[#4752C4]"
                        onClick={onDiscordConnect}
                    >
                        Connect Discord
                    </Button>
                )}

                <Button
                    variant="custom"
                    fullWidth
                    icon="fab fa-youtube"
                    iconPosition="left"
                    className="border-[#FF0000] bg-[#FF0000] hover:bg-[#CC0000]"
                >
                    YouTube
                </Button>
            </div>
        </div>
    )
}
