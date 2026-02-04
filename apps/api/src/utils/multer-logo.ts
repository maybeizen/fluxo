import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { RequestHandler } from 'express'

const storage = multer.diskStorage({
    destination: 'src/uploads/logos',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const filename = `logo-${uuidv4()}${ext}`
        cb(null, filename)
    },
})

export const uploadLogo: RequestHandler = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/svg+xml',
            'image/webp',
        ]

        if (!allowedMimeTypes.includes(file.mimetype)) {
            cb(new Error('Only PNG, JPG, SVG, and WEBP files are allowed'))
        } else {
            cb(null, true)
        }
    },
}).single('logo')
