'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@fluxo/types'
import Button from '@/components/ui/button'
import { useNotifications } from '@/context/notification-context'
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '@/lib/admin/categories'
import { parseApiError } from '@/utils/parse-api-error'
import Spinner from '@/components/ui/spinner'

export default function CategoriesPage() {
    const router = useRouter()
    const notifications = useNotifications()

    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newName, setNewName] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setIsLoading(true)
        try {
            const data = await fetchCategories()
            setCategories(data)
        } catch (error) {
            notifications.error('Failed to load categories')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newName.trim()) {
            notifications.error('Category name is required')
            return
        }

        setIsSaving(true)
        try {
            const result = await createCategory({
                name: newName.trim(),
                description: newDescription.trim() || undefined,
            })

            if (result.success) {
                notifications.success('Category created successfully')
                setNewName('')
                setNewDescription('')
                setShowCreateForm(false)
                loadCategories()
            } else {
                notifications.error(
                    result.message || 'Failed to create category'
                )
            }
        } catch (error) {
            const errorMessage = parseApiError(error)
            notifications.error(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdate = async (categoryId: string) => {
        if (!editName.trim()) {
            notifications.error('Category name is required')
            return
        }

        setIsSaving(true)
        try {
            const result = await updateCategory(categoryId, {
                name: editName.trim(),
                description: editDescription.trim() || null,
            })

            if (result.success) {
                notifications.success('Category updated successfully')
                setEditingId(null)
                setEditName('')
                setEditDescription('')
                loadCategories()
            } else {
                notifications.error(
                    result.message || 'Failed to update category'
                )
            }
        } catch (error) {
            const errorMessage = parseApiError(error)
            notifications.error(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (categoryId: string, categoryName: string) => {
        if (
            !window.confirm(
                `Are you sure you want to delete "${categoryName}"? Products using this category will become uncategorized.`
            )
        ) {
            return
        }

        try {
            const result = await deleteCategory(categoryId)

            if (result.success) {
                notifications.success('Category deleted successfully')
                loadCategories()
            } else {
                notifications.error(
                    result.message || 'Failed to delete category'
                )
            }
        } catch (error) {
            const errorMessage = parseApiError(error)
            notifications.error(errorMessage)
        }
    }

    const startEdit = (category: Category) => {
        setEditingId(category.uuid)
        setEditName(category.name)
        setEditDescription(category.description || '')
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName('')
        setEditDescription('')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Product Categories
                            </h1>
                            <p className="text-zinc-400">
                                Organize your products into categories
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            icon="fas fa-plus"
                        >
                            New Category
                        </Button>
                    </div>

                    {showCreateForm && (
                        <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                            <h2 className="mb-4 text-lg font-semibold text-white">
                                Create Category
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-white">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) =>
                                            setNewName(e.target.value)
                                        }
                                        className="focus:border-primary-300 focus:ring-primary-300 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white focus:ring-2 focus:outline-none"
                                        placeholder="e.g., Hosting Plans"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-white">
                                        Description
                                    </label>
                                    <textarea
                                        value={newDescription}
                                        onChange={(e) =>
                                            setNewDescription(e.target.value)
                                        }
                                        className="focus:border-primary-300 focus:ring-primary-300 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white focus:ring-2 focus:outline-none"
                                        placeholder="Optional description"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleCreate}
                                        loading={isSaving}
                                    >
                                        Create
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setShowCreateForm(false)
                                            setNewName('')
                                            setNewDescription('')
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                            <i className="fas fa-folder text-2xl text-zinc-600"></i>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">
                            No Categories
                        </h3>
                        <p className="max-w-md text-sm text-zinc-400">
                            Create your first category to organize products
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {categories.map((category) => (
                            <div
                                key={category.uuid}
                                className="rounded-lg border border-zinc-900 bg-zinc-950 p-6"
                            >
                                {editingId === category.uuid ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-white">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) =>
                                                    setEditName(e.target.value)
                                                }
                                                className="focus:border-primary-300 focus:ring-primary-300 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white focus:ring-2 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-white">
                                                Description
                                            </label>
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) =>
                                                    setEditDescription(
                                                        e.target.value
                                                    )
                                                }
                                                className="focus:border-primary-300 focus:ring-primary-300 w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-white focus:ring-2 focus:outline-none"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary"
                                                onClick={() =>
                                                    handleUpdate(category.uuid)
                                                }
                                                loading={isSaving}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={cancelEdit}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="mb-1 text-lg font-semibold text-white">
                                                {category.name}
                                            </h3>
                                            {category.description && (
                                                <p className="text-sm text-zinc-400">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    startEdit(category)
                                                }
                                                icon="fas fa-edit"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="fail"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        category.uuid,
                                                        category.name
                                                    )
                                                }
                                                icon="fas fa-trash"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
