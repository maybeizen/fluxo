import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { type RequestHandler } from 'express'

const ALLOWED_MIMES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
])

const MAGIC: Record<string, number[][]> = {
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
}

function normalizeExtension(mimetype: string): string {
    switch (mimetype) {
        case 'image/png':
            return '.png'
        case 'image/jpeg':
        case 'image/jpg':
            return '.jpg'
        case 'image/webp':
            return '.webp'
        default:
            return '.bin'
    }
}

function matchesMagic(buffer: Buffer, mimetype: string): boolean {
    const signatures = MAGIC[mimetype]
    if (!signatures) return false
    return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte))
}

const storage = multer.diskStorage({
    destination: 'src/uploads/tickets',
    filename: (_req, file, cb) => {
        const ext = normalizeExtension(file.mimetype)
        cb(null, `${uuidv4()}${ext}`)
    },
})

export const uploadTicketAttachment: RequestHandler = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIMES.has(file.mimetype)) {
            cb(new Error('Only PNG, JPG, and WEBP files are allowed'))
            return
        }
        cb(null, true)
    },
}).single('attachment')

export function validateUploadedFileMagic(
    buffer: Buffer,
    mimetype: string
): boolean {
    return matchesMagic(buffer, mimetype)
}
