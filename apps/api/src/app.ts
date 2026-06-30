import express, { type Application } from 'express'
import { createServer } from 'http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Server as SocketIOServer } from 'socket.io'
import helmet from 'helmet'
import { corsMiddleware } from './middleware/cors'
import apiRoutes from './api/routes'
import { sessionMiddleware } from './utils/session'
import { normalizeUserId } from './middleware/normalizeUserId'
import { maintenanceGuard } from './middleware/maintenanceGuard'
import { setupWebSocket } from './utils/websocket'
import { gatewayWebhook } from './api/v1/webhooks/gateway'
import {
    globalRateLimiter,
    webhookRateLimiter,
} from './middleware/rateLimiters'
import { errorHandler } from './middleware/errorHandler'
import { resolveStorageDir } from './utils/storage'

const __dirname = dirname(fileURLToPath(import.meta.url))
const legacyUploadsDir = resolve(__dirname, '../src/uploads')

const staticOptions = {
    maxAge: '1y' as const,
    immutable: true,
    etag: true,
    setHeaders: (res: { setHeader: (name: string, value: string) => void }) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    },
}

const app: Application = express()
const httpServer = createServer(app)

app.set('trust proxy', 1)

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5000',
        credentials: true,
    },
})

setupWebSocket(io, sessionMiddleware, normalizeUserId)

app.use('/storage', express.static(resolveStorageDir(), staticOptions))
app.use('/uploads', express.static(legacyUploadsDir, staticOptions))

app.use(helmet())
app.use(globalRateLimiter)

// Stripe/gateway webhooks need raw body for signature verification
app.post(
    '/api/v1/webhooks/gateway/:pluginId',
    webhookRateLimiter,
    express.raw({ type: 'application/json' }),
    gatewayWebhook
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(corsMiddleware)
app.use(sessionMiddleware)
app.use(normalizeUserId)
app.use(maintenanceGuard)

app.use('/api', apiRoutes)

app.use(errorHandler)

export { io }
export default httpServer
