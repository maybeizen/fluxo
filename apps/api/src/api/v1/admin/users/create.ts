import { Request, Response } from 'express'
import { createUserSchema } from '../../../../validators/admin/users/create'
import { ZodError } from 'zod'
import bcrypt from 'bcrypt'
import { env } from '../../../../utils/env'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { UserRole } from '@fluxo/types'
import { logger } from '../../../../utils/logger'
import { userCache } from '../../../../utils/cache'

export const createUser = async (req: Request, res: Response) => {
    try {
        const {
            username,
            email,
            password,
            firstName,
            lastName,
            role,
            isVerified,
        } = await createUserSchema.parseAsync(req.body)

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated.',
            })
        }

        const db = getDb()
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId))
            .limit(1)

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated.',
            })
        }

        if (currentUser.role === UserRole.STAFF && role === UserRole.ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Staff members cannot create admin users.',
            })
        }

        const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS)

        const baseSlug = username.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const suffix = Math.floor(Math.random() * 10000)
        const slug = `${baseSlug}-${suffix}`

        const [newUser] = await db
            .insert(users)
            .values({
                username,
                email,
                password: hashedPassword,
                firstName: firstName || '',
                lastName: lastName || '',
                slug,
                role: (role || UserRole.USER) as
                    | 'user'
                    | 'admin'
                    | 'staff'
                    | 'client',
                isVerified: isVerified || false,
            })
            .returning()

        await userCache.delPattern('list:*')

        const transformedUser = {
            ...newUser,
            uuid: newUser.id.toString(),
            profile: {
                username: newUser.username,
                slug: newUser.slug,
                headline: newUser.headline,
                about: newUser.about,
                avatarUrl: newUser.avatarUrl,
            },
            timestamps: {
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
            },
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: transformedUser,
        })
    } catch (error: unknown) {
        logger.error(`Error creating user - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}
