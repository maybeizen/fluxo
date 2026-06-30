import express, { type Application } from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import helmet from 'helmet'
import { corsMiddleware } from './middleware/cors'
import apiRoutes from './api/routes'
import { sessionMiddleware } from './utils/session'
import { normalizeUserId } from './middleware/normalizeUserId'
import { setupWebSocket } from './utils/websocket'
import { gatewayWebhook } from './api/v1/webhooks/gateway'
import {
    globalRateLimiter,
    webhookRateLimiter,
} from './middleware/rateLimiters'
import { errorHandler } from './middleware/errorHandler'

const app: Application = express()
const httpServer = createServer(app)

app.set('trust proxy', 1)

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
})

setupWebSocket(io, sessionMiddleware, normalizeUserId)

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

app.use(
    '/uploads',
    express.static('src/uploads', {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.svg')) {
                res.setHeader('Content-Disposition', 'attachment')
                res.setHeader('Content-Type', 'application/octet-stream')
            }
        },
    })
)

app.use('/api', apiRoutes)

app.use(errorHandler)

export { io }
export default httpServer
