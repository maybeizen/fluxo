import crypto from 'crypto'
import { env } from './env'

const IV_LENGTH = 16
const GCM_IV_LENGTH = 12
const GCM_TAG_LENGTH = 16
const GCM_PREFIX = 'v2:'
const KEY = crypto.createHash('sha256').update(env.ENCRYPTION_KEY!).digest()

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(GCM_IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
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
    const [ivHex, encryptedHex, tagHex] = payload.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]).toString('utf8')
}

function decryptCbcLegacy(payload: string): string {
    const [ivHex, encryptedHex] = payload.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encryptedText = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv)
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
