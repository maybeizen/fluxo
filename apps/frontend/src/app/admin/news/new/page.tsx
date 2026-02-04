'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createNews } from '@/lib/admin/news'
import { News, NewsVisibility } from '@fluxo/types'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import TextArea from '@/components/ui/input/text-area'
import Button from '@/components/ui/button'
import { useNotifications } from '@/context/notification-context'
import useFormValidation from '@/hooks/use-form-validation'
import {
    createNewsSchema,
    type CreateNewsFormData,
} from '@/validators/news/create'
import MarkdownEditor from '@/components/admin/news/markdown-editor'

export default function NewNewsPage() {
    const router = useRouter()
    const notifications = useNotifications()

    const [isSaving, setIsSaving] = useState(false)
    const [title, setTitle] = useState('')
    const [summary, setSummary] = useState('')
    const [content, setContent] = useState('')
    const [slug, setSlug] = useState('')
    const [visibility, setVisibility] = useState<NewsVisibility>(
        NewsVisibility.DRAFT
    )
    const [isFeatured, setIsFeatured] = useState(false)
    const [tags, setTags] = useState('')
    const [featuredImageUrl, setFeaturedImageUrl] = useState('')
    const [seoTitle, setSeoTitle] = useState('')
    const [seoDescription, setSeoDescription] = useState('')
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

    const { errors, validateAllFields, validateField } =
        useFormValidation<CreateNewsFormData>(createNewsSchema)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData: CreateNewsFormData = {
            title: title.trim(),
            summary: summary.trim(),
            content: content.trim(),
            slug: slug.trim(),
            visibility,
            isFeatured,
            tags: tags.trim(),
            featuredImageUrl: featuredImageUrl.trim(),
            seoTitle: seoTitle.trim(),
            seoDescription: seoDescription.trim(),
        }

        const validation = validateAllFields(formData)
        if (!validation.isValid) {
            notifications.error(
                'Please fix validation errors before submitting'
            )
            return
        }

        setIsSaving(true)

        const newsData = {
            title: formData.title,
            summary: formData.summary,
            content: formData.content,
            visibility: formData.visibility,
            isFeatured: formData.isFeatured,
            tags: formData.tags
                ? formData.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t)
                : [],
            metadata: {
                ...(formData.slug && { slug: formData.slug }),
                ...(formData.featuredImageUrl && {
                    featuredImageUrl: formData.featuredImageUrl,
                }),
                ...(formData.seoTitle && { seoTitle: formData.seoTitle }),
                ...(formData.seoDescription && {
                    seoDescription: formData.seoDescription,
                }),
            },
        }

        const result = await createNews(newsData as Partial<News>)

        if (result.success) {
            notifications.success('News article created successfully')
            router.push('/admin/news')
        } else {
            notifications.error(
                result.message || 'Failed to create news article'
            )
        }

        setIsSaving(false)
    }

    const handleCancel = () => {
        router.push('/admin/news')
    }

    const generateSlug = (fromTitle: string) => {
        const generatedSlug = fromTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        return generatedSlug
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)

        if (!slugManuallyEdited) {
            const generatedSlug = generateSlug(newTitle)
            setSlug(generatedSlug)
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value.toLowerCase())
        setSlugManuallyEdited(true)
    }

    const handleGenerateSlugClick = () => {
        const generatedSlug = generateSlug(title)
        setSlug(generatedSlug)
        setSlugManuallyEdited(false)
        validateField('slug', generatedSlug)
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Create News Article
                        </h1>
                        <p className="text-zinc-400">
                            Publish a new article or announcement
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        icon="fas fa-arrow-left"
                    >
                        Back to News
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Article Content
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="title" required>
                                    Title
                                </InputLabel>
                                <Input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    onBlur={() =>
                                        validateField('title', title.trim())
                                    }
                                    placeholder="Enter article title..."
                                    required
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    {title.length}/200 characters
                                </p>
                                {errors.title && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="summary" required>
                                    Summary
                                </InputLabel>
                                <TextArea
                                    id="summary"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    onBlur={() =>
                                        validateField('summary', summary.trim())
                                    }
                                    placeholder="Brief summary of the article (20-500 characters)..."
                                    rows={3}
                                    required
                                />
                                <p
                                    className={`mt-1 text-xs ${
                                        summary.length >= 20 &&
                                        summary.length <= 500
                                            ? 'text-green-500'
                                            : 'text-zinc-500'
                                    }`}
                                >
                                    {summary.length}/500 characters
                                    {summary.length >= 20 &&
                                        summary.length <= 500 && (
                                            <i className="fas fa-check ml-1"></i>
                                        )}
                                </p>
                                {errors.summary && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.summary}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="content" required>
                                    Content (Markdown)
                                </InputLabel>
                                <MarkdownEditor
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onBlur={() =>
                                        validateField('content', content.trim())
                                    }
                                    placeholder="Write your article content in markdown format..."
                                    rows={12}
                                    required
                                />
                                <p
                                    className={`mt-1 text-xs ${content.length >= 50 ? 'text-green-500' : 'text-zinc-500'}`}
                                >
                                    {content.length} characters
                                    {content.length >= 50 && (
                                        <i className="fas fa-check ml-1"></i>
                                    )}
                                </p>
                                {errors.content && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.content}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="visibility">
                                        Visibility
                                    </InputLabel>
                                    <SelectMenu
                                        id="visibility"
                                        value={visibility}
                                        onChange={(e) =>
                                            setVisibility(
                                                e.target.value as NewsVisibility
                                            )
                                        }
                                        options={[
                                            {
                                                value: NewsVisibility.DRAFT,
                                                label: 'Draft',
                                            },
                                            {
                                                value: NewsVisibility.PUBLIC,
                                                label: 'Public',
                                            },
                                            {
                                                value: NewsVisibility.PRIVATE,
                                                label: 'Private',
                                            },
                                            {
                                                value: NewsVisibility.ARCHIVED,
                                                label: 'Archived',
                                            },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="featured">
                                        Featured Article
                                    </InputLabel>
                                    <SelectMenu
                                        id="featured"
                                        value={isFeatured ? 'true' : 'false'}
                                        onChange={(e) =>
                                            setIsFeatured(
                                                e.target.value === 'true'
                                            )
                                        }
                                        options={[
                                            { value: 'false', label: 'No' },
                                            { value: 'true', label: 'Yes' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="tags">Tags</InputLabel>
                                <Input
                                    id="tags"
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="Separate tags with commas (e.g., update, announcement, feature)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Metadata & SEO
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <InputLabel htmlFor="slug" required>
                                        URL Slug
                                    </InputLabel>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleGenerateSlugClick}
                                    >
                                        <i className="fas fa-magic mr-2"></i>
                                        Regenerate from Title
                                    </Button>
                                </div>
                                <Input
                                    id="slug"
                                    type="text"
                                    value={slug}
                                    onChange={handleSlugChange}
                                    onBlur={() =>
                                        validateField('slug', slug.trim())
                                    }
                                    placeholder="auto-generated-from-title"
                                    required
                                />
                                {slug.length > 0 && (
                                    <p
                                        className={`mt-1 text-xs ${!errors.slug && slug.length >= 3 ? 'text-green-500' : 'text-zinc-500'}`}
                                    >
                                        {slug.length}/200 characters
                                        {!errors.slug && slug.length >= 3 && (
                                            <i className="fas fa-check ml-1"></i>
                                        )}
                                    </p>
                                )}
                                {errors.slug && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="featuredImage">
                                    Featured Image URL
                                </InputLabel>
                                <Input
                                    id="featuredImage"
                                    type="url"
                                    value={featuredImageUrl}
                                    onChange={(e) =>
                                        setFeaturedImageUrl(e.target.value)
                                    }
                                    onBlur={() =>
                                        validateField(
                                            'featuredImageUrl',
                                            featuredImageUrl.trim()
                                        )
                                    }
                                    placeholder="https://example.com/image.jpg"
                                />
                                {errors.featuredImageUrl && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.featuredImageUrl}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="seoTitle">
                                    SEO Title
                                </InputLabel>
                                <Input
                                    id="seoTitle"
                                    type="text"
                                    value={seoTitle}
                                    onChange={(e) =>
                                        setSeoTitle(e.target.value)
                                    }
                                    onBlur={() =>
                                        validateField(
                                            'seoTitle',
                                            seoTitle.trim()
                                        )
                                    }
                                    placeholder="Custom title for search engines (max 60 chars)"
                                    maxLength={60}
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    {seoTitle.length}/60 characters
                                </p>
                                {errors.seoTitle && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.seoTitle}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="seoDescription">
                                    SEO Description
                                </InputLabel>
                                <TextArea
                                    id="seoDescription"
                                    value={seoDescription}
                                    onChange={(e) =>
                                        setSeoDescription(e.target.value)
                                    }
                                    onBlur={() =>
                                        validateField(
                                            'seoDescription',
                                            seoDescription.trim()
                                        )
                                    }
                                    placeholder="Custom description for search engines (max 160 chars)"
                                    rows={2}
                                    maxLength={160}
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    {seoDescription.length}/160 characters
                                </p>
                                {errors.seoDescription && (
                                    <p className="text-primary-400 mt-1 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.seoDescription}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isSaving}
                        >
                            Create Article
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
