import { type Request, type Response } from 'express'
import { getDb, tickets, ticketMessages, users } from '@fluxo/db'
import { eq, and, inArray, asc, desc, sql } from '@fluxo/db'
import { ZodError } from 'zod'
import { logger } from '../../../../utils/logger'
import { ticketCache } from '../../../../utils/cache'
import { z } from 'zod'
import { serializeAuthor } from '../../../../utils/serializers/user'

const getMyTicketsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        status: z.enum(['open', 'closed', 'deleted']).optional(),
        type: z
            .enum(['general', 'account', 'billing', 'legal', 'other'])
            .optional(),
    }),
})

const getMyTicketByIdSchema = z.object({
    params: z.object({
        id: z.coerce.number('Ticket ID is required'),
    }),
})

const populateTicket = async (ticket: any, db: ReturnType<typeof getDb>) => {
    const ticketObj = { ...ticket }

    if (ticketObj.userId) {
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarKey: users.avatarKey,
                avatarUrl: users.avatarUrl,
            })
            .from(users)
            .where(eq(users.id, ticketObj.userId))
            .limit(1)
        if (user) {
            ticketObj.user = {
                ...(await serializeAuthor(user)),
                email: user.email,
            }
        }
    }

    if (ticketObj.assignedToId) {
        const [assignedUser] = await db
            .select({
                id: users.id,
                email: users.email,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarKey: users.avatarKey,
                avatarUrl: users.avatarUrl,
            })
            .from(users)
            .where(eq(users.id, ticketObj.assignedToId))
            .limit(1)
        if (assignedUser) {
            ticketObj.assignedTo = {
                ...(await serializeAuthor(assignedUser)),
                email: assignedUser.email,
            }
        }
    }

    const messages = await db
        .select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, ticketObj.id))
        .orderBy(asc(ticketMessages.createdAt))

    const systemMessageIds = messages
        .filter((m: any) => m.authorId === -1)
        .map((m: any) => m.authorId)
    const userMessageIds = messages
        .filter((m: any) => m.authorId !== -1)
        .map((m: any) => m.authorId)

    const messageAuthors =
        userMessageIds.length > 0
            ? await db
                  .select({
                      id: users.id,
                      email: users.email,
                      username: users.username,
                      slug: users.slug,
                      headline: users.headline,
                      about: users.about,
                      avatarKey: users.avatarKey,
                      avatarUrl: users.avatarUrl,
                      role: users.role,
                  })
                  .from(users)
                  .where(inArray(users.id, userMessageIds))
            : []

    const authorMap = new Map<
        number,
        Awaited<ReturnType<typeof serializeAuthor>>
    >()

    for (const u of messageAuthors) {
        authorMap.set(u.id, await serializeAuthor(u))
    }

    if (systemMessageIds.length > 0) {
        authorMap.set(-1, {
            id: -1,
            uuid: 'SYSTEM',
            email: 'system@fluxo.cc',
            profile: {
                username: 'SYSTEM',
                slug: null,
                headline: null,
                about: null,
                avatarUrl: null,
            },
            role: 'admin',
        })
    }

    ticketObj.messages = messages.map((msg: any) => ({
        ...msg,
        uuid: msg.id.toString(),
        ticketUuid: msg.ticketId.toString(),
        author: authorMap.get(msg.authorId) || null,
    }))

    return {
        ...ticketObj,
        uuid: ticketObj.id.toString(),
        timestamps: {
            createdAt: ticketObj.createdAt,
            updatedAt: ticketObj.updatedAt,
            respondedToAt: ticketObj.respondedToAt,
            closedAt: ticketObj.closedAt,
            deletedAt: ticketObj.deletedAt,
        },
    }
}

export const getMyTickets = async (req: Request, res: Response) => {
    try {
        const validated = getMyTicketsSchema.parse({ query: req.query })
        const { page, limit, status, type } = validated.query

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const cacheKey = `client:${userId}:${page}:${limit}:${status || 'all'}:${type || 'all'}`
        const cached = await ticketCache.get(cacheKey)

        if (cached) {
            return res.status(200).json(cached)
        }

        const db = getDb()
        const conditions = [eq(tickets.userId, userId)]

        if (status) {
            conditions.push(eq(tickets.status, status as any))
        }

        if (type) {
            conditions.push(eq(tickets.type, type as any))
        }

        const whereClause = and(...conditions)

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(tickets)
            .where(whereClause)
        const total = Number(totalResult[0]?.count || 0)

        const ticketDocs = await db
            .select()
            .from(tickets)
            .where(whereClause)
            .orderBy(desc(tickets.createdAt))
            .limit(limit)
            .offset((page - 1) * limit)

        const ticketsList = await Promise.all(
            ticketDocs.map((ticket) => populateTicket(ticket, db))
        )

        const response = {
            success: true,
            message: 'Tickets fetched successfully',
            tickets: ticketsList,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }

        await ticketCache.set(cacheKey, response, 120)

        return res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error fetching tickets - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export const getMyTicketById = async (req: Request, res: Response) => {
    try {
        const validated = getMyTicketByIdSchema.parse({ params: req.params })
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const ticketId = validated.params.id
        const cacheKey = `client:${userId}:${ticketId}`
        const cached = await ticketCache.get(cacheKey)
        if (cached) {
            return res.status(200).json(cached)
        }

        const db = getDb()
        const [ticketDoc] = await db
            .select()
            .from(tickets)
            .where(and(eq(tickets.id, ticketId), eq(tickets.userId, userId)))
            .limit(1)

        if (!ticketDoc) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            })
        }

        const ticket = await populateTicket(ticketDoc, db)

        const response = {
            success: true,
            message: 'Ticket fetched successfully',
            ticket,
        }

        await ticketCache.set(cacheKey, response, 180)

        return res.status(200).json(response)
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        logger.error(`Error fetching ticket - ${error}`)
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
