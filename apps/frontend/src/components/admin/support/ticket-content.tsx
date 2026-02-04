'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import remarkGfm from 'remark-gfm'

const ReactMarkdown = dynamic(() => import('react-markdown'), {
    ssr: false,
})

interface TicketContentProps {
    content: string
}

export default function TicketContent({ content }: TicketContentProps) {
    return (
        <div className="mb-4 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    )
}
