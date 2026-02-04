'use client'

import React, { useState, forwardRef } from 'react'
import TextArea from '@/components/ui/input/text-area'
import dynamic from 'next/dynamic'
import remarkGfm from 'remark-gfm'

const ReactMarkdown = dynamic(() => import('react-markdown'), {
    ssr: false,
})

interface MarkdownEditorProps {
    id: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    onBlur?: () => void
    placeholder?: string
    rows?: number
    required?: boolean
    noBorder?: boolean
}

const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
    (
        {
            id,
            value,
            onChange,
            onBlur,
            placeholder,
            rows = 12,
            required = false,
            noBorder = false,
        },
        ref
    ) => {
        const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

        return (
            <div className={`rounded-lg`}>
                <div className="mb-2 flex items-center gap-2 rounded-md">
                    <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        className={`cursor-pointer rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'write'
                                ? 'text-primary-400 bg-zinc-800'
                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                        }`}
                    >
                        <i className="fas fa-edit mr-2"></i>
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`cursor-pointer rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'preview'
                                ? 'text-primary-400 bg-zinc-800'
                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                        }`}
                    >
                        <i className="fas fa-eye mr-2"></i>
                        Preview
                    </button>
                    <div className="ml-auto rounded-md bg-zinc-900 px-4 py-2 text-xs text-zinc-500">
                        Supports{' '}
                        <a
                            href="https://www.markdownguide.org/basic-syntax/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300"
                        >
                            Markdown
                        </a>
                    </div>
                </div>

                <div className="">
                    {activeTab === 'write' ? (
                        <TextArea
                            ref={ref}
                            id={id}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            rows={rows}
                            required={required}
                            className="resize-none border-0 focus:ring-0"
                        />
                    ) : (
                        <div className="max-h-[500px] min-h-[300px] overflow-y-auto rounded-md border border-zinc-800 bg-zinc-900/50 px-6">
                            {value.trim() ? (
                                <div className="prose">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {value}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                                        <i className="fas fa-file-lines text-2xl text-zinc-600"></i>
                                    </div>
                                    <p className="text-sm text-zinc-500">
                                        Nothing to preview
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-600">
                                        Write some content to see the preview
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }
)

MarkdownEditor.displayName = 'MarkdownEditor'

export default MarkdownEditor
