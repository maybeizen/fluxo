'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Product } from '@fluxo/types'
import { fetchProductById, updateProduct } from '@/lib/admin/products'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'
import useFormValidation from '@/hooks/use-form-validation'
import {
    editProductSchema,
    type EditProductFormData,
} from '@/validators/product/edit-product'
import ProductMetadataForm from '@/components/admin/products/product-metadata-form'
import ProductStatusForm from '@/components/admin/products/product-status-form'
import ServicePluginIntegrationForm from '@/components/admin/products/service-plugin-integration-form'
import ProductTabs from '@/components/admin/products/product-tabs'
import { fetchPluginsList } from '@/lib/plugins/loader'
import type { PluginListItem } from '@/lib/plugins/loader'

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const notifications = useNotifications()
    const { errors, validateAllFields, validateField } =
        useFormValidation<EditProductFormData>(editProductSchema)
    const productId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [product, setProduct] = useState<Product | null>(null)

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

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await fetchProductById(productId)
                if (!data) {
                    notifications.error('Product not found')
                    router.push('/admin/products')
                    return
                }

                setProduct(data)
                setName(data.metadata.name)
                setDescription(data.metadata.description)

                setPrice(data.metadata.price / 100)
                setTags(data.metadata.tags?.join(', ') || '')

                setHidden(data.status.hidden)
                setDisabled(data.status.disabled)
                setAllowCoupons(data.status.allowCoupons)

                setStockEnabled(data.stock.stockEnabled)
                setStock(data.stock.stock)

                setCategory(data.category || null)

                setServicePluginId(
                    (data.integrations as { servicePluginId?: string })
                        ?.servicePluginId ?? ''
                )
                setServicePluginConfig(
                    (
                        data.integrations as {
                            servicePluginConfig?: Record<string, unknown>
                        }
                    )?.servicePluginConfig ?? {}
                )
            } catch (error) {
                console.error('Error loading product:', error)
                notifications.error('Failed to load product')
                router.push('/admin/products')
            } finally {
                setIsLoading(false)
            }
        }

        loadProduct()
    }, [productId])

    const hasChanges = () => {
        if (!product) return false

        const currentTags = tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        const originalTags = product.metadata.tags || []

        return (
            name !== product.metadata.name ||
            description !== product.metadata.description ||
            Math.round(price * 100) !== product.metadata.price ||
            JSON.stringify(currentTags) !== JSON.stringify(originalTags) ||
            hidden !== product.status.hidden ||
            disabled !== product.status.disabled ||
            allowCoupons !== product.status.allowCoupons ||
            stockEnabled !== product.stock.stockEnabled ||
            stock !== product.stock.stock ||
            category !== (product.category || null) ||
            servicePluginId !==
                ((product.integrations as { servicePluginId?: string })
                    ?.servicePluginId ?? '') ||
            JSON.stringify(servicePluginConfig) !==
                JSON.stringify(
                    (
                        product.integrations as {
                            servicePluginConfig?: Record<string, unknown>
                        }
                    )?.servicePluginConfig ?? {}
                )
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hasChanges()) {
            notifications.info('No changes to save')
            router.push('/admin/products')
            return
        }

        const formData: EditProductFormData = {
            name,
            description,
            price,
            tags: tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            hidden,
            disabled,
            allowCoupons,
            stockEnabled,
            stock: stockEnabled ? stock : null,
            category,
            cpu: 0,
            ram: 0,
            storage: 0,
            ports: 0,
            databases: 0,
            backups: 0,
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
            const updates: Record<string, unknown> = {}

            if (
                name !== product?.metadata.name ||
                description !== product?.metadata.description ||
                Math.round(price * 100) !== product?.metadata.price ||
                JSON.stringify(formData.tags) !==
                    JSON.stringify(product?.metadata.tags || [])
            ) {
                updates.metadata = {
                    name,
                    description,
                    price,
                    tags: formData.tags,
                }
            }

            if (
                hidden !== product?.status.hidden ||
                disabled !== product?.status.disabled ||
                allowCoupons !== product?.status.allowCoupons
            ) {
                updates.status = {
                    hidden,
                    disabled,
                    allowCoupons,
                }
            }

            if (
                stockEnabled !== product?.stock.stockEnabled ||
                stock !== product?.stock.stock
            ) {
                updates.stock = {
                    stockEnabled,
                    stock: stockEnabled ? stock : null,
                }
            }

            if (category !== (product?.category || null)) {
                updates.category = category === '' ? null : category || null
            }

            const currentServicePluginId =
                (product?.integrations as { servicePluginId?: string })
                    ?.servicePluginId ?? ''
            const currentServicePluginConfig =
                (
                    product?.integrations as {
                        servicePluginConfig?: Record<string, unknown>
                    }
                )?.servicePluginConfig ?? {}
            if (
                servicePluginId !== currentServicePluginId ||
                JSON.stringify(servicePluginConfig) !==
                    JSON.stringify(currentServicePluginConfig)
            ) {
                updates.integrations = {
                    servicePluginId: servicePluginId || null,
                    servicePluginConfig: servicePluginConfig || null,
                }
            }

            const result = await updateProduct(productId, updates)

            if (result.success) {
                notifications.success('Product updated successfully')
                router.push('/admin/products')
            } else {
                notifications.error(
                    result.message || 'Failed to update product'
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
                notifications.error('Failed to update product')
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push('/admin/products')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="py-20 text-center">
                        <i className="fas fa-exclamation-triangle text-primary-400 mb-4 text-4xl"></i>
                        <p className="text-zinc-400">Product not found</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Edit Product
                        </h1>
                        <p className="text-zinc-400">
                            Update product information
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
                            servicePlugins={pluginsList.filter(
                                (p) => p.type === 'service' && p.enabled
                            )}
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
                            disabled={!hasChanges()}
                        >
                            <i className="fas fa-save mr-2"></i>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
