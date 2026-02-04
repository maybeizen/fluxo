import cors, { type CorsOptions } from 'cors'
import { env } from '../utils/env'
import { Handler } from 'express'

export const corsOptions: CorsOptions = {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
}

export const corsMiddleware: Handler = cors(corsOptions)
