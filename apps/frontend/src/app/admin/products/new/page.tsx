'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/lib/admin/products'
import Button from '@/components/ui/button'
import { useNotifications } from '@/context/notification-context'
import useFormValidation from '@/hooks/use-form-validation'
import {
    createProductSchema,
    type CreateProductFormData,
} from '@/validators/product/create-product'
import ProductMetadataForm from '@/components/admin/products/product-metadata-form'
import ProductStatusForm from '@/components/admin/products/product-status-form'
import ServicePluginIntegrationForm from '@/components/admin/products/service-plugin-integration-form'
import ProductTabs from '@/components/admin/products/product-tabs'
import { fetchPluginsList } from '@/lib/plugins/loader'
import type { PluginListItem } from '@/lib/plugins/loader'

export default function NewProductPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const { errors, validateAllFields, validateField } =
        useFormValidation<CreateProductFormData>(createProductSchema)

    const [isSaving, setIsSaving] = useState(false)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState<number>(0)
    const [tags, setTags] = useState<string>('')

    const [hidden, setHidden] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [allowCoupons, setAllowCoupons] = useState(true)

    const [stockEnabled, setStockEnabled] = useState(false)
    const [stock, setStock] = useState<number | null>(null)

    const [category, setCategory] = useState<string | null>(null)

    const [pluginsList, setPluginsList] = useState<PluginListItem[]>([])
    const [servicePluginId, setServicePluginId] = useState<string>('')
    const [servicePluginConfig, setServicePluginConfig] = useState<
        Record<string, unknown>
    >({})

    useEffect(() => {
        fetchPluginsList()
            .then(setPluginsList)
            .catch(() => setPluginsList([]))
    }, [])

    const servicePlugins = pluginsList.filter(
        (p) => p.type === 'service' && p.enabled
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData: CreateProductFormData = {
            name,
            description,
            price,
            tags: tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            cpu: 0,
            ram: 0,
            storage: 0,
            ports: 0,
            databases: 0,
            backups: 0,
            hidden,
            disabled,
            allowCoupons,
            stockEnabled,
            stock: stockEnabled ? stock : null,
            category,
        }

        const validation = validateAllFields(formData)
        if (!validation.isValid) {
            const errorMessages = Object.entries(validation.errors)
                .map(([field, message]) => `${field}: ${message}`)
                .join('; ')
            notifications.error(
                errorMessages ||
                    'Please fix the validation errors before submitting'
            )
            return
        }

        setIsSaving(true)

        try {
            const result = await createProduct({
                metadata: {
                    name,
                    description,
                    price,
                    tags: formData.tags || [],
                },
                specifications: {
                    cpu: 0,
                    ram: 0,
                    storage: 0,
                    ports: 0,
                    databases: 0,
                    backups: 0,
                },
                status: {
                    hidden,
                    disabled,
                    allowCoupons,
                },
                stock: {
                    stockEnabled,
                    stock: stockEnabled ? stock : null,
                },
                category: category || null,
                integrations:
                    servicePluginId && servicePluginId.length > 0
                        ? {
                              servicePluginId,
                              servicePluginConfig: servicePluginConfig || {},
                          }
                        : undefined,
            })

            if (result.success && result.product) {
                notifications.success('Product created successfully')

                router.push(`/admin/products/${result.product.uuid}/edit`)
            } else {
                notifications.error(
                    result.message || 'Failed to create product'
                )
            }
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'response' in error &&
                (
                    error.response as {
                        data?: {
                            errors?: Array<{
                                field?: string
                                message?: string
                            }>
                        }
                    }
                )?.data?.errors
            ) {
                const errorMessages = (
                    error.response as {
                        data: {
                            errors: Array<{ field?: string; message?: string }>
                        }
                    }
                ).data.errors
                    .map((err) => `${err.field}: ${err.message}`)
                    .join(', ')
                notifications.error(errorMessages)
            } else {
                notifications.error('Failed to create product')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push('/admin/products')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Create Product
                        </h1>
                        <p className="text-zinc-400">
                            Add a new hosting product to the system
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        icon="fas fa-arrow-left"
                    >
                        Back to Products
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <ProductTabs
                        tabs={[
                            {
                                id: 'metadata',
                                label: 'Product Information',
                                icon: 'fas fa-info-circle',
                            },
                            {
                                id: 'integrations',
                                label: 'Integrations',
                                icon: 'fas fa-plug',
                            },
                            {
                                id: 'status',
                                label: 'Status & Stock',
                                icon: 'fas fa-cog',
                            },
                        ]}
                    >
                        <ProductMetadataForm
                            name={name}
                            setName={setName}
                            description={description}
                            setDescription={setDescription}
                            price={price}
                            setPrice={setPrice}
                            tags={tags}
                            setTags={setTags}
                            category={category}
                            setCategory={setCategory}
                            errors={errors}
                            validateField={validateField}
                        />

                        <ServicePluginIntegrationForm
                            servicePlugins={servicePlugins}
                            servicePluginId={servicePluginId}
                            setServicePluginId={setServicePluginId}
                            servicePluginConfig={servicePluginConfig}
                            setServicePluginConfig={setServicePluginConfig}
                            disabled={isSaving}
                        />

                        <ProductStatusForm
                            hidden={hidden}
                            setHidden={setHidden}
                            disabled={disabled}
                            setDisabled={setDisabled}
                            allowCoupons={allowCoupons}
                            setAllowCoupons={setAllowCoupons}
                            stockEnabled={stockEnabled}
                            setStockEnabled={setStockEnabled}
                            stock={stock}
                            setStock={setStock}
                            errors={errors}
                            validateField={validateField}
                        />
                    </ProductTabs>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isSaving}
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Create Product
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
