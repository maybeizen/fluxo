import multer from 'multer'
import path from 'path'
import { RequestHandler } from 'express'

const storage = multer.diskStorage({
    destination: 'src/uploads/avatars',
    filename: (req, file, cb) => {
        cb(
            null,
            `${req.session.userId}-${Date.now()}${path.extname(file.originalname)}`
        )
    },
})

export const upload: RequestHandler = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg']

        if (!allowedMimeTypes.includes(file.mimetype)) {
            cb(
                new Error(
                    `Only ${allowedMimeTypes.join(', ')} files are allowed`
                )
            )
        } else {
            cb(null, true)
        }
    },
}).single('avatar')
