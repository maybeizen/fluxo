import { Request, Response } from 'express'
import { getDb, tickets, ticketMessages, users } from '@fluxo/db'
import { eq, and, inArray, asc, desc, sql } from '@fluxo/db'
import { ZodError } from 'zod'
import { logger } from '../../../../utils/logger'
import { ticketCache } from '../../../../utils/cache'
import { z } from 'zod'

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
                avatarUrl: users.avatarUrl,
            })
            .from(users)
            .where(eq(users.id, ticketObj.userId))
            .limit(1)
        if (user) {
            ticketObj.user = {
                id: user.id,
                uuid: user.id.toString(),
                email: user.email,
                profile: {
                    username: user.username,
                    slug: user.slug,
                    headline: user.headline,
                    about: user.about,
                    avatarUrl: user.avatarUrl,
                },
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
                avatarUrl: users.avatarUrl,
            })
            .from(users)
            .where(eq(users.id, ticketObj.assignedToId))
            .limit(1)
        if (assignedUser) {
            ticketObj.assignedTo = {
                id: assignedUser.id,
                uuid: assignedUser.id.toString(),
                email: assignedUser.email,
                profile: {
                    username: assignedUser.username,
                    slug: assignedUser.slug,
                    headline: assignedUser.headline,
                    about: assignedUser.about,
                    avatarUrl: assignedUser.avatarUrl,
                },
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
                      avatarUrl: users.avatarUrl,
                      role: users.role,
                  })
                  .from(users)
                  .where(inArray(users.id, userMessageIds))
            : []

    const authorMap = new Map(
        messageAuthors.map((u: any) => [
            u.id,
            {
                id: u.id,
                uuid: u.id.toString(),
                email: u.email,
                profile: {
                    username: u.username,
                    slug: u.slug,
                    headline: u.headline,
                    about: u.about,
                    avatarUrl: u.avatarUrl,
                },
                role: u.role,
            },
        ])
    )

    if (systemMessageIds.length > 0) {
        authorMap.set(-1, {
            id: -1,
            uuid: 'SYSTEM',
            email: 'system@fluxo.cc',
            profile: {
                username: 'SYSTEM',
            },
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
    const startTime = Date.now()
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
        const cacheGetStart = Date.now()
        const cached = await ticketCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getMyTickets - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getMyTickets - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

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

        const cacheSetStart = Date.now()
        await ticketCache.set(cacheKey, response, 120)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getMyTickets - Key: ${cacheKey}, TTL: 120s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

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
    const startTime = Date.now()
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

        const cacheGetStart = Date.now()
        const cached = await ticketCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getMyTicketById - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getMyTicketById - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

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

        const cacheSetStart = Date.now()
        await ticketCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getMyTicketById - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

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
