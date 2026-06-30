import crypto from 'node:crypto'

const GCM_IV_LENGTH = 12
const GCM_PREFIX = 'v2:'

let cachedKey: Buffer | null = null

function getKey(): Buffer {
    if (cachedKey) return cachedKey
    const raw = process.env.ENCRYPTION_KEY
    if (!raw) {
        throw new Error(
            'ENCRYPTION_KEY is not set. Required for encrypting or decrypting secrets.'
        )
    }
    cachedKey = crypto.createHash('sha256').update(raw).digest()
    return cachedKey
}

export function encrypt(text: string): string {
    const key = getKey()
    const iv = crypto.randomBytes(GCM_IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    return (
        GCM_PREFIX +
        iv.toString('hex') +
        ':' +
        encrypted.toString('hex') +
        ':' +
        tag.toString('hex')
    )
}

function decryptGcm(payload: string): string {
    const key = getKey()
    const parts = payload.split(':')
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted payload format')
    }
    const [ivHex, encryptedHex, tagHex] = parts
    const iv = Buffer.from(ivHex!, 'hex')
    const encrypted = Buffer.from(encryptedHex!, 'hex')
    const tag = Buffer.from(tagHex!, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]).toString('utf8')
}

function decryptCbcLegacy(payload: string): string {
    const key = getKey()
    const parts = payload.split(':')
    if (parts.length !== 2) {
        throw new Error('Invalid encrypted payload format')
    }
    const [ivHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex!, 'hex')
    const encryptedText = Buffer.from(encryptedHex!, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}

export function decrypt(text: string): string {
    if (text.startsWith(GCM_PREFIX)) {
        return decryptGcm(text.slice(GCM_PREFIX.length))
    }
    return decryptCbcLegacy(text)
}
