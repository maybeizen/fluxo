export interface ProductMetadata {
    name: string
    description: string
    price: number
    tags: string[]
}

export interface ProductTimestamps {
    createdAt: Date
    updatedAt: Date
}

export interface ProductSpecifications {
    cpu: number
    ram: number
    storage: number
    ports: number
    databases: number
    backups: number
}

export interface ProductStatus {
    hidden: boolean
    disabled: boolean
    allowCoupons: boolean
}

export interface ProductStock {
    stockEnabled: boolean
    stock: number | null
}

import { ProductIntegrations } from './product-integration'

export interface Product {
    uuid: string
    metadata: ProductMetadata
    specifications: ProductSpecifications
    status: ProductStatus
    stock: ProductStock
    timestamps: ProductTimestamps
    category?: string | null
    order?: number
    integrations?: ProductIntegrations
}
