'use client'

import React from 'react'
import Image from 'next/image'

type MinecraftType = 'java' | 'bedrock'

interface TypeSelectionProps {
    selectedType: MinecraftType
    onTypeChange: (type: MinecraftType) => void
}

export default function TypeSelection({
    selectedType,
    onTypeChange,
}: TypeSelectionProps) {
    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
            <h2 className="mb-2 text-xl font-semibold text-white">
                Step 1: Choose Type
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
                Select your Minecraft edition.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                    type="button"
                    onClick={() => onTypeChange('java')}
                    className={`cursor-pointer overflow-hidden rounded-lg border-2 p-6 transition-all ${
                        selectedType === 'java'
                            ? 'border-primary-400 bg-primary-400/10'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                >
                    <div className="relative mb-4 h-32 w-full overflow-hidden rounded">
                        <Image
                            src="/java.jpg"
                            alt="Minecraft Java Edition"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                        Minecraft: Java Edition
                    </h3>
                    <p className="text-sm text-zinc-400">
                        Classic Minecraft experience with plugins and mods
                        support
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => onTypeChange('bedrock')}
                    className={`cursor-pointer overflow-hidden rounded-lg border-2 p-6 transition-all ${
                        selectedType === 'bedrock'
                            ? 'border-primary-400 bg-primary-400/10'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                >
                    <div className="relative mb-4 h-32 w-full overflow-hidden rounded">
                        <Image
                            src="/bedrock.jpg"
                            alt="Minecraft Bedrock Edition"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                        Minecraft: Bedrock Edition
                    </h3>
                    <p className="text-sm text-zinc-400">
                        Cross-platform Minecraft for Windows, Xbox, and mobile
                        devices
                    </p>
                </button>
            </div>
        </div>
    )
}
