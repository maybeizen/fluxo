import multer from 'multer'
import { type RequestHandler } from 'express'

const MAGIC: Record<string, number[][]> = {
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/jpg': [[0xff, 0xd8, 0xff]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
}

function matchesMagic(buffer: Buffer, mimetype: string): boolean {
    if (mimetype === 'image/svg+xml') {
        const header = buffer.toString('utf8', 0, Math.min(buffer.length, 256))
        return header.includes('<svg')
    }

    const signatures = MAGIC[mimetype]
    if (!signatures) return false
    return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte))
}

export function validateUploadedFileMagic(
    buffer: Buffer,
    mimetype: string
): boolean {
    return matchesMagic(buffer, mimetype)
}

export function normalizeExtension(mimetype: string): string {
    switch (mimetype) {
        case 'image/png':
            return '.png'
        case 'image/jpeg':
        case 'image/jpg':
            return '.jpg'
        case 'image/webp':
            return '.webp'
        case 'image/svg+xml':
            return '.svg'
        default:
            return '.bin'
    }
}

interface CreateUploadOptions {
    field: string
    maxSize: number
    allowedMimes: string[]
}

export function createUpload({
    field,
    maxSize,
    allowedMimes,
}: CreateUploadOptions): RequestHandler {
    const allowedSet = new Set(allowedMimes)

    return multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: maxSize },
        fileFilter: (_req, file, cb) => {
            if (!allowedSet.has(file.mimetype)) {
                cb(
                    new Error(
                        `Only ${allowedMimes.join(', ')} files are allowed`
                    )
                )
                return
            }
            cb(null, true)
        },
    }).single(field)
}

export const uploadAvatar: RequestHandler = createUpload({
    field: 'avatar',
    maxSize: 5 * 1024 * 1024,
    allowedMimes: ['image/png', 'image/jpeg', 'image/jpg'],
})

export const uploadLogo: RequestHandler = createUpload({
    field: 'logo',
    maxSize: 2 * 1024 * 1024,
    allowedMimes: [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
        'image/webp',
    ],
})

export const uploadTicketAttachment: RequestHandler = createUpload({
    field: 'attachment',
    maxSize: 5 * 1024 * 1024,
    allowedMimes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
})
