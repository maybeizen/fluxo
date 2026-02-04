import crypto from 'crypto'
import { env } from './env'

const IV_LENGTH = 16
const KEY = crypto.createHash('sha256').update(env.ENCRYPTION_KEY!).digest()

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encryptedText = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}
