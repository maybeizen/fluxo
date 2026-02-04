import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {
    type Product,
    type ProductMetadata,
    type ProductSpecifications,
    type ProductStatus,
    type ProductStock,
    type ProductTimestamps,
    type ProductIntegrations,
    type PterodactylIntegration,
} from '@fluxo/types'

const ProductTimestampsSchema = new Schema<ProductTimestamps>({
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
})

const ProductMetadataSchema = new Schema<ProductMetadata>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String], required: true, default: [] },
})

const ProductSpecificationsSchema = new Schema<ProductSpecifications>({
    cpu: { type: Number, required: true },
    ram: { type: Number, required: true },
    storage: { type: Number, required: true },
    ports: { type: Number, required: true },
    databases: { type: Number, required: true },
    backups: { type: Number, required: true },
})

const ProductStatusSchema = new Schema<ProductStatus>({
    hidden: { type: Boolean, required: true, default: false },
    disabled: { type: Boolean, required: true, default: false },
    allowCoupons: { type: Boolean, required: true, default: true },
})

const ProductStockSchema = new Schema<ProductStock>({
    stockEnabled: { type: Boolean, required: true, default: false },
    stock: { type: Number, required: false, default: null },
})

const PterodactylIntegrationSchema = new Schema<PterodactylIntegration>({
    enabled: { type: Boolean, required: true, default: false },
    locationId: { type: Number, required: false },
    nodeId: { type: Number, required: false },
    nestId: { type: Number, required: false },
    eggId: { type: Number, required: false },
    memory: { type: Number, required: false },
    swap: { type: Number, required: false },
    disk: { type: Number, required: false },
    io: { type: Number, required: false },
    cpu: { type: Number, required: false },
    cpuPinning: { type: String, required: false },
    databases: { type: Number, required: false },
    backups: { type: Number, required: false },
    additionalAllocations: { type: Number, required: false },
    oomKiller: { type: Boolean, required: false, default: false },
    skipEggInstallScript: { type: Boolean, required: false, default: false },
    startOnCompletion: { type: Boolean, required: false, default: true },
})

const ProductIntegrationsSchema = new Schema<ProductIntegrations>({
    pterodactyl: { type: PterodactylIntegrationSchema, required: false },
})

const productSchema = new Schema<Product>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        metadata: { type: ProductMetadataSchema, required: true },
        specifications: { type: ProductSpecificationsSchema, required: true },
        status: { type: ProductStatusSchema, required: true },
        stock: { type: ProductStockSchema, required: true },
        timestamps: { type: ProductTimestampsSchema, required: true },
        category: {
            type: String,
            required: false,
            default: null,
        },
        order: {
            type: Number,
            required: false,
            default: 0,
        },
        integrations: {
            type: ProductIntegrationsSchema,
            required: false,
        },
    },
    {
        timestamps: {
            createdAt: 'timestamps.createdAt',
            updatedAt: 'timestamps.updatedAt',
        },
    }
)

productSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    next()
})

productSchema.index({ uuid: 1 })
productSchema.index({ 'metadata.name': 1 })
productSchema.index({ 'status.hidden': 1 })
productSchema.index({ 'status.disabled': 1 })
productSchema.index({ category: 1, order: 1 })

export const ProductModel = model<Product>('Product', productSchema)
