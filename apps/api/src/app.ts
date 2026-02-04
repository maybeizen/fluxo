import express, { type Application } from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { corsMiddleware } from './middleware/cors'
import apiRoutes from './api/routes'
import { sessionMiddleware } from './utils/session'
import { normalizeUserId } from './middleware/normalizeUserId'
import { setupWebSocket } from './utils/websocket'

const app: Application = express()
const httpServer = createServer(app)

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
})

setupWebSocket(io)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(corsMiddleware)
app.use(sessionMiddleware)
app.use(normalizeUserId)

app.use('/uploads', express.static('src/uploads'))

app.use('/api', apiRoutes)

export { io }
export default httpServer
